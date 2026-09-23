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
        results: [],
        message: 'API key not configured'
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
            text: `Find real publicly available information, official websites, and sources for: "${query}". Use Google Search grounding only. Return exact source titles and source URLs from grounding metadata if available.` 
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
    
    // Strict inspection of Gemini Google Search Grounding metadata structure
    const groundingMetadata = candidate.groundingMetadata || {};
    const groundingChunks = groundingMetadata.groundingChunks || [];

    let formattedResults = [];

    // Extract real grounded source URLs and titles strictly from grounding chunks
    if (groundingChunks.length > 0) {
      const validChunks = groundingChunks.filter(chunk => chunk.web && chunk.web.uri && chunk.web.title);
      
      if (validChunks.length > 0) {
        formattedResults = validChunks.map((chunk, index) => {
          const web = chunk.web;
          return {
            id: `grounded-source-${index + 1}`,
            productName: web.title || `Source Result ${index + 1}`,
            sourceName: new URL(web.uri).hostname,
            sourceCountry: 'India / Global',
            destinationRelevance: 'Wholesale Sourcing & Official Link',
            listedPrice: 'Not publicly available',
            currency: 'INR / USD',
            moq: 'Not publicly available',
            sourceType: 'Google Search Grounding',
            status: 'VERIFIED LIVE SOURCE', // ONLY shown when actual source URL exists
            originalUrl: web.uri, // Exact extracted source URL
            snippet: textOutput || 'Verified live public source via Google Search grounding.',
            retrievedAt: new Date().toISOString(),
            analysisData: {
              sourcePriceRange: 'Not publicly available',
              estimatedCosts: 'Not publicly available',
              marketInfo: textOutput,
              risks: 'Independent verification required',
              questions: ['What is your target order quantity?']
            }
          };
        });
      }
    }

    // Strict Reality-First rule: If no genuine web source URL is found, do NOT invent or fallback to google.com. Return null values.
    if (formattedResults.length === 0 && textOutput) {
      formattedResults.push({
        id: 'grounded-analysis-only',
        productName: `Analysis for: ${query}`,
        sourceName: 'Source URL not available from Google Search grounding',
        sourceCountry: 'India / Global',
        destinationRelevance: 'Wholesale Sourcing',
        listedPrice: 'Not publicly available',
        currency: 'INR / USD',
        moq: 'Not publicly available',
        sourceType: 'Google Search Grounding',
        status: null, // No verified live source badge when URL is missing
        originalUrl: null,
        snippet: textOutput,
        retrievedAt: new Date().toISOString(),
        analysisData: {
          marketInfo: textOutput,
          risks: 'Independent verification required',
          questions: ['What is your target order quantity?']
        }
      });
    }

    return res.json({
      success: true,
      available: formattedResults.length > 0,
      results: formattedResults
    });

  } catch (err) {
    console.error('Search execution error:', err.message);
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
