const status = document.getElementById('status');
const micButton = document.querySelector('.btn-mic');
const sendButton = document.querySelector('.btn-send');
const stopButton = document.querySelector('.btn-stop');
const userInput = document.getElementById('userInput');
const messagesContainer = document.getElementById('messages');
const chatContainer = document.querySelector('.chat-container');
const recordingDisabledMessage = document.createElement('div');
recordingDisabledMessage.id = 'recording-disabled-message';
recordingDisabledMessage.textContent = 'Recording is disabled during message generation.';
document.body.appendChild(recordingDisabledMessage);

let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let isGenerating = false;

navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);

    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioURL = URL.createObjectURL(audioBlob);

        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const resampledBuffer = await resampleAudioBuffer(audioBuffer, 16000);
        const wavBlob = encodeWAV(resampledBuffer, 16000);
        const wavURL = URL.createObjectURL(wavBlob);

        const file = new File([wavBlob], 'recording.wav', { type: 'audio/wav' });

        // Upload to server and set up EventSource for streaming responses
        const formData = new FormData();
        formData.append('file', file);
        formData.append('temperature', '0.0');
        formData.append('temperature_inc', '0.2');
        formData.append('response_format', 'verbose_json');

        const response = await fetch('http://127.0.0.1:8080/inference', {
            method: 'POST',
            body: formData,
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let transcriptionText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = decoder.decode(value, { stream: true });
            const json = JSON.parse(text);
            transcriptionText += appendTranscription(json);
        }

        sendMessage(transcriptionText);  // Automatically send the message after transcription
        audioChunks = []; // Clear the audio chunks after processing
    };
}).catch(error => {
    console.error('Error accessing microphone:', error);
    status.textContent = `Error accessing microphone: ${error.message}`;
});

micButton.addEventListener('click', () => {
    if (isGenerating) {
        showRecordingDisabledMessage();
    } else if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !isRecording && event.target !== userInput) {
        event.preventDefault();
        if (isGenerating) {
            showRecordingDisabledMessage();
        } else {
            startRecording();
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'Space' && isRecording && event.target !== userInput) {
        event.preventDefault();
        stopRecording();
    }
});

sendButton.addEventListener('click', () => {
    const userText = userInput.value.trim();
    if (userText) {
        sendMessage(userText);
        userInput.value = '';
    }
});

function startRecording() {
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
        audioChunks = [];
        mediaRecorder.start();
        isRecording = true;
        status.textContent = 'Recording...';
        micButton.classList.add('recording'); // Add a class to indicate recording state
        chatContainer.classList.add('recording'); // Change background color to indicate recording
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        isRecording = false;
        status.textContent = 'Processing...';
        micButton.classList.remove('recording'); // Remove the recording state class
        chatContainer.classList.remove('recording'); // Revert background color
    }
}

function appendTranscription(data) {
    let transcriptionText = '';
    if (data.segments) {
        data.segments.forEach(segment => {
            transcriptionText += segment.text + ' ';
        });
    }
    return transcriptionText.trim();
}

async function resampleAudioBuffer(audioBuffer, targetSampleRate) {
    const audioContext = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
        audioBuffer.numberOfChannels,
        audioBuffer.duration * targetSampleRate,
        targetSampleRate
    );

    const bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = audioBuffer;
    bufferSource.connect(audioContext.destination);
    bufferSource.start(0);

    const renderedBuffer = await audioContext.startRendering();
    return renderedBuffer;
}

function encodeWAV(audioBuffer, sampleRate) {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numberOfChannels * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let offset = 0;
    let pos = 0;

    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    // RIFF identifier
    writeString(view, offset, 'RIFF'); offset += 4;
    // RIFF chunk length
    view.setUint32(offset, 36 + audioBuffer.length * 2, true); offset += 4;
    // WAVE identifier
    writeString(view, offset, 'WAVE'); offset += 4;
    // fmt sub-chunk
    writeString(view, offset, 'fmt '); offset += 4;
    // fmt chunk length
    view.setUint32(offset, 16, true); offset += 4;
    // Audio format (PCM)
    view.setUint16(offset, 1, true); offset += 2;
    // Number of channels
    view.setUint16(offset, numberOfChannels, true); offset += 2;
    // Sample rate
    view.setUint32(offset, sampleRate, true); offset += 4;
    // Byte rate (sample rate * block align)
    view.setUint32(offset, sampleRate * numberOfChannels * 2, true); offset += 4;
    // Block align (channel count * bytes per sample)
    view.setUint16(offset, numberOfChannels * 2, true); offset += 2;
    // Bits per sample
    view.setUint16(offset, 16, true); offset += 2;
    // data sub-chunk
    writeString(view, offset, 'data'); offset += 4;
    // Data chunk length
    view.setUint32(offset, audioBuffer.length * numberOfChannels * 2, true); offset += 4;

    // Write the PCM samples
    for (let i = 0; i < audioBuffer.length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
            // Convert the float sample to PCM and write it to the buffer
            let sample = audioBuffer.getChannelData(channel)[i];
            sample = Math.max(-1, Math.min(1, sample));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
    }

    return new Blob([buffer], { type: 'audio/wav' });
}

window.sendMessage = function(userText) {
    if (!userText) {
        alert("Please enter a message.");
        return;
    }

    // Disable the send button
    sendButton.disabled = true;
    isGenerating = true;
    disableRecording();

    addMessage(userText, 'user-message');

    ensureSingleEventSource();
    const eventSource = new EventSource(`/generate-text?prompt=${encodeURIComponent(userText)}`);
    let botMessageContent = ""; 

    eventSource.onmessage = function(event) {
        const messages = event.data.split('\n').filter(line => line.startsWith('data:'));
        
        messages.forEach(message => {
            const jsonData = JSON.parse(message.slice(5));
            if (jsonData && jsonData.choices && jsonData.choices.length > 0) {
                jsonData.choices.forEach(choice => {
                    if (choice.delta && choice.delta.content) {
                        botMessageContent += choice.delta.content; 
                    }
                });
            }
        });

        updateBotMessage(botMessageContent); 
    };

    eventSource.onend = function() {
        if (botMessageContent) {
            updateBotMessage(botMessageContent, true); 
        }
        sendButton.disabled = false; // Re-enable the send button
        isGenerating = false;
        enableRecording();
    };

    eventSource.onerror = function(error) {
        console.error('Stream error:', error);
        eventSource.close(); // Close stream on error
        sendButton.disabled = false; // Re-enable the send button
        isGenerating = false;
        enableRecording();
    };

    window.currentEventSource = eventSource; // Track the current event source
};

window.stopGeneration = function() {
    if (window.currentEventSource) {
        window.currentEventSource.close(); // Close the EventSource
        window.currentEventSource = null;

        // Re-enable the send button when generation is stopped
        sendButton.disabled = false;
        isGenerating = false;
        enableRecording();
    }
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
    const stopButton = document.querySelector(".btn-stop");

    // Attach the event listener in JavaScript, instead of using inline HTML
    stopButton.addEventListener("click", stopGeneration);

    // Add key listener for Enter key
    userInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent the default action (form submission, if inside a form)
            const userText = userInput.value.trim();
            if (userText) {
                sendMessage(userText); // Pass the user input to sendMessage function
                userInput.value = ''; // Clear the input field
            }
        }
    });
});

function updateBotMessage(text, finalize = false) {
    let botMessageElement = document.querySelector('.bot-message:last-child');
    if (!botMessageElement || finalize) {
        botMessageElement = document.createElement('div');
        botMessageElement.className = 'bot-message message';
        messagesContainer.appendChild(botMessageElement);
    }
    botMessageElement.innerHTML = marked.parse(text); // Use marked to convert Markdown to HTML
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the bottom
}

function disableRecording() {
    micButton.classList.add('disabled');
}

function enableRecording() {
    micButton.classList.remove('disabled');
}

function showRecordingDisabledMessage() {
    recordingDisabledMessage.style.display = 'block';
    setTimeout(() => {
        recordingDisabledMessage.style.display = 'none';
    }, 3000);
}
