
// Ensure sendMessage is defined in the global scope
window.sendMessage = function() {
  const userText = userInput.value.trim();
  if (!userText) {
      alert("Please enter a message.");
      return;
  }

  addMessage(userText, 'user-message');
  userInput.value = ''; // Clear input field after sending the message

  ensureSingleEventSource();
  const eventSource = new EventSource(`/generate-text?prompt=${encodeURIComponent(userText)}`);
  let botMessageContent = ""; // Buffer to accumulate bot's response
  eventSource.onmessage = function(event) {
    const messages = event.data.split('\n').filter(line => line.startsWith('data:'));
    
    messages.forEach(message => {
      const jsonData = JSON.parse(message.slice(5));
      if (jsonData && jsonData.choices && jsonData.choices.length > 0) {
        jsonData.choices.forEach(choice => {
          if (choice.delta && choice.delta.content) {
            botMessageContent += choice.delta.content; // Accumulate response content
          }
        });
      }
    });

    updateBotMessage(botMessageContent); // Update or create the bot message element
  };

  eventSource.onend = function() {
    // Optionally finalize any updates when stream ends
    if (botMessageContent) {
      updateBotMessage(botMessageContent, true); // Ensure final message is updated/displayed
    }
  };

  eventSource.onerror = function(error) {
    console.error('Stream error:', error);
    eventSource.close(); // Close stream on error

  };

  window.currentEventSource = eventSource; // Track the current event source
};

function addMessage(text, senderClass) {
  const messageElement = document.createElement('div');
  messageElement.textContent = text;
  messageElement.className = `${senderClass} message`;
  messagesContainer.appendChild(messageElement);
  // Optionally, scroll the container to the bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function ensureSingleEventSource() {
  if (window.currentEventSource) {
      window.currentEventSource.close();
      window.currentEventSource = null;
  }
}

document.addEventListener("DOMContentLoaded", function() {
  window.userInput = document.getElementById("userInput");
  const sendButton = document.querySelector(".btn-send");
  window.messagesContainer = document.getElementById("messages");

  // Attach the event listener in JavaScript, instead of using inline HTML
  sendButton.addEventListener("click", sendMessage);
});

function updateBotMessage(text, finalize = false) {
  let botMessageElement = document.querySelector('.bot-message:last-child');
  if (!botMessageElement || finalize) {
    botMessageElement = document.createElement('div');
    botMessageElement.className = 'bot-message message';
    messagesContainer.appendChild(botMessageElement);
  }
  botMessageElement.textContent = text;
  messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the bottom
}