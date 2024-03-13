const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const { OpenAI } = require('openai');
const app = express();
const port = 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/recommendation', async (req, res) => {
    const { points, cards } = req.body;

    try {
        const recommendation = await getOpenAIRecommendation(points, cards);
        res.json({ recommendation: recommendation });
    } catch (error) {
        console.error('Error getting recommendation:', error);
        res.status(500).send('An error occurred on the server');
    }
});

async function getOpenAIRecommendation(points, cards) {
    const systemPrompt = `I will pass on my current points and list with cards that are still in the blackjack deck. You answer if it is advisable to ask for another letter or not, so that I do not go over 21 points. Respond only with 'Ask' or 'Stop'`;
    const userPrompt = `Points: ${points}. Cards: ${cards}`;

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            "role": "system",
            "content": systemPrompt
          },
          {
            "role": "user",
            "content": userPrompt
          }
        ],
        temperature: 0.0,
        max_tokens: 300,
    });

    //console.log(response);
    //console.log(response.choices[0].message);

    return response.choices[0].message.content;
}

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
