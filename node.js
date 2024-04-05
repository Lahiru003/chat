import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';
import express from 'express';

const app = express();
app.use(express.static('public'));
app.use(express.json());

const api_key = process.env.API_KEY;
const apiUrl = 'https://api.urassignment.shop/v1/chat/completions';
const systemPrompt = process.env.SYSTEM_PROMPT;

app.post('/send-message', async (req, res) => {
    const userText = req.body.userText;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${api_key}`
            },
            body: JSON.stringify({
                model: "TheBloke/dolphin-2.6-mistral-7B-GGUF/dolphin-2.6-mistral-7b.Q8_0.gguf",
                messages: [{ "role": "system", "content": systemPrompt },
                { "role": "user", "content": userText }],
                temperature: 0.7,
            })
        });

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            const messages = data.choices.map(choice => choice.message.content);
            res.json({ messages });
        } else {
            res.status(500).send('Error: Invalid response from API');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error processing request');
    }
});

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
