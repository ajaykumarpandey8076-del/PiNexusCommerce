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
            text: `Find real publicly available wholesale suppliers, manufacturers, products, prices, MOQ, and source URLs for the international commerce query: "${query}". Use Google Search grounding only. Do not invent or estimate anything. If any fact or price is not publicly available, state "Not publicly available".` 
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
    
    // Extract Google Search grounding metadata and chunks
    const groundingMetadata = candidate.groundingMetadata || {};
    const groundingChunks = groundingMetadata.groundingChunks || [];

    let formattedResults = [];

    // Generic extraction of real web sources from grounding chunks
    if (groundingChunks.length > 0) {
      const validChunks = groundingChunks.filter(chunk => chunk.web && chunk.web.uri && chunk.web.title);
      
      if (validChunks.length > 0) {
        formattedResults = validChunks.map((chunk, index) => {
          const web = chunk.web;
          return {
            id: `grounded-result-${index + 1}`,
            productName: web.title,
            sourceName: new URL(web.uri).hostname,
            sourceCountry: 'India / Global',
            destinationRelevance: 'International Wholesale Sourcing',
            listedPrice: 'Not publicly available',
            currency: 'INR / USD',
            moq: 'Not publicly available',
            sourceType: 'Google Search Grounding',
            status: 'VERIFIED LIVE SOURCE', // Strict: Only populated when real web URI exists
            originalUrl: web.uri,
            snippet: textOutput || 'Verified live public source via Google Search grounding.',
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
    }

    // Reality-First Policy: Do not fabricate fake results or fallback placeholder URLs
    if (formattedResults.length === 0) {
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
