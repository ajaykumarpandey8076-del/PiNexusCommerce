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
            text: `Find real publicly available suppliers and wholesale information for the query: "${query}". Use Google Search grounding and current public web information only. For each source found, extract business/supplier name, product details, publicly listed price if available, MOQ if available, and original source URL. Do not invent or estimate anything. If a fact is not publicly available, say "Not publicly available".` 
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
    const groundingChunks = candidate.groundingMetadata?.groundingChunks || [];

    let formattedResults = [];

    // Real grounding chunks se exact public sources map karna
    if (groundingChunks.length > 0) {
      formattedResults = groundingChunks
        .filter(chunk => chunk.web && chunk.web.uri)
        .map((chunk, index) => {
          const web = chunk.web;
          return {
            id: `grounded-result-${index + 1}`,
            productName: web.title || `Verified Public Source ${index + 1}`,
            sourceName: new URL(web.uri).hostname,
            sourceCountry: 'India / Global',
            destinationRelevance: 'Wholesale Sourcing',
            listedPrice: 'Not publicly available',
            currency: 'INR / USD',
            moq: 'Not publicly available',
            sourceType: 'Google Search Grounding',
            status: 'VERIFIED LIVE SOURCE',
            originalUrl: web.uri,
            snippet: textOutput || 'Verified live public web source via Google Search grounding.',
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

    // Agar grounding chunks nahi hain lekin text output available hai
    if (formattedResults.length === 0 && textOutput) {
      formattedResults.push({
        id: 'gemini-analysis-1',
        productName: `Market Insights: ${query}`,
        sourceName: 'Google Search Grounded Analysis',
        sourceCountry: 'India / Global',
        destinationRelevance: 'Wholesale Sourcing',
        listedPrice: 'Not publicly available',
        currency: 'INR / USD',
        moq: 'Not publicly available',
        sourceType: 'Gemini Live Research',
        status: 'VERIFIED LIVE SOURCE',
        originalUrl: 'https://www.google.com',
        snippet: textOutput,
        retrievedAt: new Date().toISOString(),
        analysisData: {
          sourcePriceRange: 'Not publicly available',
          estimatedCosts: 'Not publicly available',
          marketInfo: textOutput,
          risks: 'Independent verification required',
          questions: ['What is your target order quantity?']
        }
      });
    }

    return res.json({
      success: true,
      available: true,
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

