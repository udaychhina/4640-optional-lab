// Create Random Number for Chat ID (GUID requires secure connection)
const CHAT_ID = String(Math.floor(Math.random() * 100000)).padStart(6,'0')

// Creating a WebSocket instance on script load
const socket = new WebSocket(`ws://${config.server}/chat/`);

// When Connection opened create event handlers for button clicks 
socket.addEventListener('open', (event) => {
    var initial_connect = {
        "payload": {
            "message": "websocket connected",
            "id": CHAT_ID
        }
    }
    socket.send(JSON.stringify(initial_connect));
    document.getElementById("heading").innerText += `: ${CHAT_ID}\n`
    document.getElementById("status").innerText = `Initial Connection:\n${initial_connect.payload.message}\n`

    // Send message
    document.getElementById("send_btn").addEventListener("click", () => {
        var message = {
            "payload": {
                "user_name": `${document.getElementById('user_name').value}`,
                "message": `${document.getElementById('message').value}`,
                "id": CHAT_ID
            }
        }
        socket.send(JSON.stringify(message))
        document.getElementById("status").innerText += `\nMessage sent:\n${JSON.stringify(message.payload)}\n`
    })

    // Close connection
    document.getElementById("close_btn").addEventListener("click", () => {
        var message = {
            "payload": {
                "user_name": `${document.getElementById('user_name').value}`,
                "message": "Closing Connection",
                "id": CHAT_ID
            }
        }
        socket.send(JSON.stringify(message))
        socket.close(code=1000, reason=`Client ${CHAT_ID}: closed connection`);
        document.getElementById("status").innerText += `\nConnection close issued by client: ${CHAT_ID}\n`
        document.getElementById("status").innerText += `${JSON.stringify(message.payload)}\n`
    })
});

// Listen for Message
socket.addEventListener('message', (event) => {
    try {
        var message_json = JSON.parse(event.data);
        document.getElementById("status").innerText += `\nMessage Received:\n ${JSON.stringify(message_json.payload)}\n` 

    } catch (e) {
        console.log('Wrong format');
        return;
    }
});

// Listen for Connection closed
socket.addEventListener('close', (event) => {
    document.getElementById("status").innerText += "\nServer connection closed received:\n"
    document.getElementById("status").innerText +=  `${event.code}:${event.reason}:${event.wasClean}\n` 
});