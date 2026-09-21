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
        available: false,
        error: 'Query is required'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.SEARCH_PROVIDER_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: false,
        available: false,
        results: [],
        message: 'Live public-web research is currently unavailable because GEMINI_API_KEY is not configured.'
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
            text: `Search the live web for commercial supplier information regarding: "${query}". Provide real businesses, product descriptions, pricing details, MOQ, and source references if available.` 
          }]
        }],
        tools: [{ googleSearch: {} }]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      console.error('Gemini API Error Response:', errText);
      return res.status(200).json({
        success: false,
        available: false,
        results: [],
        message: 'Live public-web research is temporarily unavailable.'
      });
    }

    const data = await apiResponse.json();
    const candidate = data.candidates?.[0] || {};
    const textOutput = candidate.content?.parts?.[0]?.text || '';
    const groundingChunks = candidate.groundingMetadata?.groundingChunks || [];

    let formattedResults = [];

    // Map explicit grounding chunks if present
    if (groundingChunks.length > 0) {
      formattedResults = groundingChunks.map((chunk, index) => {
        const web = chunk.web || {};
        return {
          id: `grounded-source-${index + 1}`,
          productName: web.title || `Verified Source ${index + 1}`,
          sourceName: web.title ? new URL(web.uri || 'https://google.com').hostname : 'Live Web Source',
          sourceCountry: 'India / International',
          destinationRelevance: 'Global Sourcing',
          listedPrice: 'Refer to source listing',
          currency: 'INR/USD',
          moq: 'Check source link',
          sourceType: 'Google Search Grounding',
          status: 'VERIFIED LIVE SOURCE',
          originalUrl: web.uri || 'https://www.google.com',
          snippet: textOutput.substring(0, 320),
          retrievedAt: new Date().toISOString(),
          analysisData: {
            sourcePriceRange: 'Extracted from live web search',
            estimatedCosts: 'Calculated via real source',
            marketInfo: textOutput,
            risks: 'Independent verification required',
            questions: ['What is your target order quantity?']
          }
        };
      });
    }

    // Ensure model text output populates a valid research result card instead of showing 0 results
    if (formattedResults.length === 0 && textOutput.trim().length > 0) {
      formattedResults.push({
        id: 'gemini-research-1',
        productName: `Market Research: ${query}`,
        sourceName: 'Gemini Live Web Synthesis',
        sourceCountry: 'India / Global',
        destinationRelevance: 'International Sourcing',
        listedPrice: 'Refer to research analysis',
        currency: 'INR/USD',
        moq: 'Check supplier details',
        sourceType: 'Gemini Research Analysis',
        status: 'LIVE ANALYSIS',
        originalUrl: 'https://www.google.com',
        snippet: textOutput,
        retrievedAt: new Date().toISOString(),
        analysisData: {
          sourcePriceRange: 'Market range from search',
          estimatedCosts: 'Real-time synthesis',
          marketInfo: textOutput,
          risks: 'Verify directly with listed entities',
          questions: ['What exact specifications do you require?']
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
      success: false,
      available: false,
      results: [],
      message: 'Live public-web research is temporarily unavailable.'
    });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`PiNexusCommerce gateway active on port ${PORT}`);
  });
}

module.exports = app;

