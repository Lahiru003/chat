function sendMessage() {
    const userText = document.getElementById('userInput').value;
    addMessage(userText, 'user-message message');
    document.getElementById('userInput').value = ''; // Clear input field

    fetch('/send-message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userText })
    })
    .then(response => response.json())
    .then(data => {
        if (data.messages && data.messages.length > 0) {
            // Join the message parts into a single message
            const completeMessage = data.messages.join(" ");
            addMessage(  completeMessage, 'bot-message message');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


function addMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.textContent = text;
    messageElement.className = sender;
    document.getElementById('messages').appendChild(messageElement);
}

// No need to listen to SSE for individual client messages
// Removed listenToMessages function call if not using SSE for other features
function listenToMessages() {
    const eventSource = new EventSource('/stream');
    eventSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.data && data.data.message) {
            addMessage("pookie: " + data.data.message, 'bot-message');
        }
    };
}

listenToMessages();