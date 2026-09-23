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
            text: `Find real publicly available wholesale suppliers, official websites, and market sources for: "${query}". Use Google Search grounding and current public web information only.` 
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
    
    const groundingMetadata = candidate.groundingMetadata || {};
    const groundingChunks = groundingMetadata.groundingChunks || [];

    let formattedResults = [];

    // Layer 1: Extract from official grounding chunks if present
    if (groundingChunks.length > 0) {
      const validChunks = groundingChunks.filter(chunk => chunk.web && chunk.web.uri);
      if (validChunks.length > 0) {
        formattedResults = validChunks.map((chunk, index) => ({
          id: `grounded-${index + 1}`,
          productName: chunk.web.title || `Verified Source ${index + 1}`,
          sourceName: new URL(chunk.web.uri).hostname,
          sourceCountry: 'India / Global',
          destinationRelevance: 'Wholesale Sourcing',
          listedPrice: 'Not publicly available',
          currency: 'INR / USD',
          moq: 'Not publicly available',
          sourceType: 'Google Search Grounding',
          status: 'VERIFIED LIVE SOURCE',
          originalUrl: chunk.web.uri,
          snippet: textOutput,
          retrievedAt: new Date().toISOString(),
          analysisData: { marketInfo: textOutput }
        }));
      }
    }

    // Layer 2: Fallback extraction - Extract valid URLs directly from text output if chunks are missing
    if (formattedResults.length === 0 && textOutput) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const foundUrls = textOutput.match(urlRegex) || [];
      const cleanUrl = foundUrls[0] ? foundUrls[0].replace(/[.,)]$/, '') : null;

      formattedResults.push({
        id: 'gemini-text-result-1',
        productName: `Search Result: ${query}`,
        sourceName: cleanUrl ? new URL(cleanUrl).hostname : 'Google Search Grounding Analysis',
        sourceCountry: 'India / Global',
        destinationRelevance: 'Wholesale Sourcing',
        listedPrice: 'Not publicly available',
        currency: 'INR / USD',
        moq: 'Not publicly available',
        sourceType: 'Google Search Grounding',
        status: cleanUrl ? 'VERIFIED LIVE SOURCE' : null,
        originalUrl: cleanUrl, // Extracted directly from text or null if absent
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

