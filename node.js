const express = require('express');
const app = express();

app.use(express.static('public'));

app.get('/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Function to send a message
    const sendMessage = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // // Example: Send a message every second
    // const intervalId = setInterval(() => {
    //     sendMessage({ message: 'Hello from server', timestamp: new Date() });
    // }, 1000);

    // Clean up when the connection is closed
    
});

// Make sure the port number matches what you expose and want to use
const port = 3000; // Use 3000 or any other port you prefer
app.listen(port, () => console.log(`Server running on port ${port}`));