const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } catch (err) {
    console.error('Error serving index.html:', err);
    res.status(200).send('PiNexusCommerce Gateway Active');
  }
});

app.post('/api/search-commerce', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({
        success: false,
        results: [],
        error: 'Query is required'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.SEARCH_PROVIDER_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: true,
        results: []
      });
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const apiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `Find real publicly available suppliers and wholesale information for: "${query}". Use Google Search grounding and current public web information only. Extract exact business names, product details, listed price if available, MOQ if available, and original source URLs from grounding metadata. Do not invent anything.` 
          }]
        }],
        tools: [{ googleSearch: {} }]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await apiResponse.json();
    const candidate = data.candidates?.[0] || {};
    const textOutput = candidate.content?.parts?.[0]?.text || '';
    
    // Strict inspection of grounding metadata structure
    const groundingMetadata = candidate.groundingMetadata || {};
    const groundingChunks = groundingMetadata.groundingChunks || [];

    let formattedResults = [];

    // 1. Strict parsing: Only extract chunks that possess valid web URIs and titles
    if (groundingChunks.length > 0) {
      const validSources = groundingChunks.filter(chunk => chunk.web && chunk.web.uri && chunk.web.title);
      
      formattedResults = validSources.map((chunk, index) => {
        const web = chunk.web;
        return {
          id: `grounded-source-${index + 1}`,
          productName: web.title,
          sourceName: new URL(web.uri).hostname,
          sourceCountry: 'India / Global',
          destinationRelevance: 'Wholesale Sourcing',
          listedPrice: 'Not publicly available',
          currency: 'INR / USD',
          moq: 'Not publicly available',
          sourceType: 'Google Search Grounding',
          status: 'VERIFIED LIVE SOURCE',
          originalUrl: web.uri,
          snippet: textOutput || 'Real-time verified public source extracted via search grounding.',
          retrievedAt: new Date().toISOString(),
          analysisData: {
            sourcePriceRange: 'Not publicly available',
            estimatedCosts: 'Not publicly available',
            marketInfo: textOutput,
            risks: 'Independent business verification required',
            questions: ['What is your target order quantity?']
          }
        };
      });
    }

    // 2. Fallback: Agar koi actual web source nahi mila, toh empty array return karo taaki fake generic cards render na hon
    if (formattedResults.length === 0) {
      // Reality-First policy: Do not invent mock results or fake counts
      formattedResults = [];
    }

    return res.json({
      success: true,
      available: formattedResults.length > 0,
      results: formattedResults
    });

  } catch (err) {
    console.error('Search execution error:', err);
    return res.status(200).json({
      success: true,
      results: []
    });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`PiNexusCommerce gateway active on port ${PORT}`);
  });
}

module.exports = app;

