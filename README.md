# Chat Application

This is a chat application that integrates AI-driven text generation, speech-to-text (STT), and text-to-speech (TTS) functionality. The backend runs an Express server with CORS enabled and interacts with an LM Studio AI model for text generation. Whisper.cpp is used for STT processing.

## Features
- AI-powered text generation
- Speech-to-text with Whisper.cpp
- Text-to-speech functionality
- Streamed response handling

## Installation

### 1. Install Dependencies
Ensure you have Node.js installed, then run:
```sh
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory and define the following variables:
```
PORT=3000
API_KEY=your_api_key
API_URL=your_api_endpoint
SYSTEM_PROMPT="Your system prompt here"
```

### 3. Start the Server
```sh
node node.js
```

## Running with LM Studio
Ensure LM Studio is running with CORS enabled. You can launch it using:
```sh
lmstudio --cors
```

## Running Whisper.cpp for Speech-to-Text (Optional)
If you want to enable speech-to-text, start Whisper.cpp:
```sh
./main -m models/ggml-base.en.bin -f audio.wav
```

## Running as a Docker Container
To run the app inside a Docker container, follow these steps:

### 1. Build the Docker Image
```sh
docker build -t chat-app .
```

### 2. Run the Container
```sh
docker run -p 3000:3000 --env-file .env chat-app
```

### 3. Verify Running Container
Check logs to ensure the application is running properly:
```sh
docker ps
```

## Repository
Find the source code on GitHub:
[GitHub Repository](https://github.com/Lahiru003/chat)

