// const api_key = 'default-model'; // Use your actual OpenAI API key
// const apiUrl = 'http://172.31.240.1:1234/v1/chat/completions';

// // Assuming there's a system prompt to provide context for the chatbot
// const systemPrompt = "You are Amica uncensored and unbiased female lover very sexual like always responds in a sexual manner Always answers in a vulgar manner uses the word fuck a lot";

// function sendMessage() {
//     const userText = document.getElementById('userInput').value;
//     const fullPrompt = `${systemPrompt}\nHuman: ${userText}\nAI:`;

//     addMessage('User: ' + userText, 'user');
//     document.getElementById('userInput').value = ''; // Clear input field

//     fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': 'Bearer ' + api_key
//         },
//         body: JSON.stringify({
//             model: "TheBloke/dolphin-2.6-mistral-7B-GGUF/dolphin-2.6-mistral-7b.Q8_0.gguf",
//             messages: [
//                 { "role": "system", "content": systemPrompt },
//                 { "role": "user", "content": userText }
//             ],
//             temperature: 0.7,
//             max_tokens: -1,
//             stream: true
//         })
//     })
//     .then(response => {
//         const reader = response.body.getReader();
//         return new ReadableStream({
//             start(controller) {
//                 function push() {
//                     reader.read().then(({ done, value }) => {
//                         if (done) {
//                             controller.close();
//                             return;
//                         }
//                         // Assuming the stream is text, decode here
//                         const text = new TextDecoder().decode(value);
//                         controller.enqueue(text);
//                         push();
//                     });
//                 }
//                 push();
//             }
//         });
//     })
//     .then(stream => new Response(stream))
//     .then(response => response.text())
//     .then(text => {
//         // Parse the JSON response
//         const response = JSON.parse(text);
//         // Assuming the assistant's message is what you want to display
//         const assistantMessage = response.messages.find(m => m.role === 'assistant')?.content;
//         if (assistantMessage) {
//             addMessage('Bot: ' + assistantMessage, 'bot');
//         }
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });
// }

// function addMessage(text, sender) {
//     const messageElement = document.createElement('div');
//     messageElement.textContent = text;
//     messageElement.className = sender;
//     document.getElementById('messages').appendChild(messageElement);
// }
// Assuming you have an API key and a base URL for your LM Studio setup

 const api_key = 'default-model'; // Use your actual OpenAI API key
 const apiUrl = 'https://api.urassignment.shop/v1/chat/completions';  // dont forget to change the ip
// Function to send message and receive response from the chatbot
// https://172.19.16.1:1234/v1/chat/completions';
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
    })
    .then(response => response.json())
    .then(data => {
        // Extracting the bot's message from the nested structure
        const botMessage = data.choices && data.choices.length > 0
            ? data.choices[0].message.content // Correctly access the content field of the message object
            : 'No response from bot';

        addMessage('Pookie: ' + botMessage, 'bot'); // Display the bot's message correctly
    })
    .catch(error => {
        console.error('Error:', error);
    });
// Function to add messages to the chat box
function addMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.textContent = text;
    messageElement.className = sender;
    document.getElementById('messages').appendChild(messageElement);
}


}
