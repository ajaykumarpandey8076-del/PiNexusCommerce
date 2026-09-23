const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Search query is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide structured factual information based strictly on public web sources for: ${query}. Extract real business names, products, prices, MOQ, and ensure actual source URLs are referenced.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const textResponse = response.text();
    
    // Extract grounding chunks and web metadata safely
    let sources = [];
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks;

    if (groundingChunks && groundingChunks.length > 0) {
      for (const chunk of groundingChunks) {
        if (chunk.web?.uri && chunk.web?.title) {
          const uri = chunk.web.uri;
          if (uri.startsWith('http') && !uri.includes('google.com/search?q=')) {
            sources.push({
              title: chunk.web.title,
              url: uri,
              snippet: textResponse
            });
          }
        }
      }
    }

    // Fallback if no structured web chunks, but text exists
    if (sources.length === 0 && textResponse) {
      sources.push({
        title: "Public Web Research Result",
        url: null,
        snippet: textResponse
      });
    }

    res.json({
      success: true,
      query: query,
      sources: sources,
      rawText: textResponse
    });

  } catch (error) {
    console.error('Search API Error:', error);
    res.status(500).json({ success: false, error: 'Live research is temporarily unavailable. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`PiNexusCommerce Server running on port ${PORT}`);
});
module.exports = app;


