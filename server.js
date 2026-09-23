const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini API with your key
const ai = new GoogleGenAI({ apiKey: 'AIzaSyA.AQ.Ab8RN6L7kky3HB0VcPQat64LIaKMBItdLX2iik0tr3ocGZ1Y9A' });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for live research/search
app.post('/api/search', async (req, res) => {
    try {
        const { query } = req.body;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: query,
        });
        res.json({ result: response.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Live research is temporarily unavailable.' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

