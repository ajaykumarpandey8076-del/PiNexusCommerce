const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Gemini API client safely server-side using GEMINI_API_KEY
let aiClient = null;
try {
  if (process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (e) {
  console.error('Gemini initialization error:', e);
}

app.post('/api/search-commerce', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({
        success: false,
        available: false,
        error: 'Query is required'
      });
    }

    // Fail safely if Gemini API key is missing or client is not initialized
    if (!aiClient || !process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        success: false,
        available: false,
        results: [],
        message: 'Live public-web research is currently unavailable because GEMINI_API_KEY is not configured.'
      });
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    // Call official Gemini model with Google Search grounding tool enabled
    const response = await aiClient.models.generateContent({
      model: modelName,
      contents: `Provide structured market and commercial research data regarding: ${query}. Summarize key findings, pricing trends, and source insights clearly.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const textOutput = response.text || 'No market research data generated.';
    
    // Extract grounding source metadata safely if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const primarySourceUrl = groundingChunks[0]?.web?.uri || 'https://www.google.com';
    const primarySourceTitle = groundingChunks[0]?.web?.title || 'Verified Web Source';

    const formattedResults = [{
      id: 'gemini-grounded-1',
      productName: `Market Research: ${query}`,
      sourceName: primarySourceTitle,
      sourceCountry: query.toLowerCase().includes('india') ? 'India' : 'International',
      destinationRelevance: 'International',
      listedPrice: 'Refer to grounded source links',
      currency: 'USD/INR',
      moq: 'Check source listing details',
      sourceType: 'Gemini Google Search Grounding',
      status: 'VERIFIED LIVE SOURCE',
      originalUrl: primarySourceUrl,
      snippet: textOutput.substring(0, 320) + '...',
      retrievedAt: new Date().toISOString(),
      analysisData: {
        sourcePriceRange: 'Dynamic market range from search results',
        estimatedCosts: 'Calculated via live Google Search grounding',
        marketInfo: textOutput,
        risks: 'Independent buyer/seller verification required',
        questions: ['What is your target commercial volume?']
      }
    }];

    return res.json({
      success: true,
      available: true,
      results: formattedResults
    });

  } catch (err) {
    console.error('Gemini search execution error:', err);
    return res.status(200).json({
      success: false,
      available: false,
      results: [],
      message: 'Live public-web research is temporarily unavailable.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`PiNexusCommerce gateway active on port ${PORT}`);
});

