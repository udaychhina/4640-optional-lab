import { hostname } from "os";
const SERVER_NAME = hostname();
const LOG_PATH = "/var/log/chat/log.txt";

// Append request's logs to the log's file
async function log(requestLog: string) {
    try {
        const logs = await Bun.file(LOG_PATH).text();
        // Write (file's content + request's log)
        await Bun.write(LOG_PATH, logs.concat(requestLog));
    } catch (e) {
        // If log's file doesn't exist, write new content
        await Bun.write(LOG_PATH, ''.concat(requestLog));
    }
}

const wsserver = Bun.serve({

    port: 80,

    fetch(req, server) {
        // upgrade the request to a WebSocket
        if (server.upgrade(req)) {
            return; // do not return a Response
        }
        return new Response("Upgrade failed :(", { status: 500 });
    },

    websocket: {
        async message(ws, msg) {
            var message_json;
            try {
                message_json = JSON.parse(msg.toString());

            } catch (e) {
                // If the message is not a valid JSON, ignore it
                log(`${new Date()} Invalid JSON message received:  ${msg.toString()} \n`)
                return;
            }

            // Re-Broadcast the message to all connected clients
            var new_message = {
                "payload": {
                    "relayed_by": SERVER_NAME,
                    "user_name": message_json.payload.user_name,
                    "message": message_json.payload.message,
                    "id": message_json.payload.id,
                }
            }
            ws.publish("chat", JSON.stringify(new_message))

            log(`${new Date()} broadcasting message : ${msg.toString()}\n`)

        },
        // a socket is opened
        async open(ws) {
            ws.subscribe("chat")
            // log connection open
            log(`${new Date()} web socket opened from ${ws.remoteAddress}\n`)
        }, 
        async close(ws, code, message) {
            // log connection closed
            log(`${new Date()} web socket closed: ${code.toString()} ${message.toString()}\n` )
        }, // a socket is closed
        async drain(ws) { }, // the socket is ready to receive more data
    },
});

