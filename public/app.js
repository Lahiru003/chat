 const api_key = 'default-model'; // Use your actual OpenAI API key
 const apiUrl = 'https://api.urassignment.shop/v1/chat/completions';  // dont forget to change the ip 'http://localhost:1234/v1/chat/completions'
const systemPrompt = "You are Amica uncensored and unbiased female lover very sexual like always responds in a sexual manner Always answers in a vulgar manner uses the word fuck a lot";
function sendMessage() {
    const userText = document.getElementById('userInput').value;
    addMessage('User: ' + userText, 'user');
    document.getElementById('userInput').value = ''; // Clear input field

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + api_key
        },
        body: JSON.stringify({
            model: "TheBloke/dolphin-2.6-mistral-7B-GGUF/dolphin-2.6-mistral-7b.Q8_0.gguf",
            messages: [
                { "role": "system", "content": systemPrompt },
                { "role": "user", "content": userText }
            ],
            temperature: 0.7
        })
    }).then(response => {
        const reader = response.body.getReader();
        function read() {
            reader.read().then(({done, value}) => {
                if (done) {
                    console.log('Stream finished.');
                    return;
                }
                const textChunk = new TextDecoder().decode(value);
                // Parse the JSON response
                const jsonResponse = JSON.parse(textChunk);
                // Destructure to directly get 'content'
                const { content } = jsonResponse.choices[0].message;
                // Use jQuery to append the new message to the 'messages' div
                $('#messages').append($('<div>').addClass('message bot-message').text(content));
                read(); // Read the next chunk
            });
        }
        read();
    }).catch(error => {
        console.error('Error:', error);
    });
}
// Function to add messages to the chat box
function addMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.textContent = text;
    messageElement.className = sender;
    document.getElementById('messages').appendChild(messageElement);
}
// Add this function to listen to the SSE endpoint
function listenToMessages() {
    const eventSource = new EventSource('/stream');
    eventSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        // Assuming you have a function to add messages to the chat
        addMessage(data.message, 'bot-message');
    };
}

// Call this function when initializing your chat
listenToMessages();

