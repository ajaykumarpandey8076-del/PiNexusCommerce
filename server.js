const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); // ya built-in fetch agar Node version modern hai

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Server-side Public Web Commerce Research Engine Endpoint
app.post('/api/search-commerce', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const apiKey = process.env.SEARCH_PROVIDER_API_KEY;
    const searchEngineId = process.env.SEARCH_ENGINE_ID;

    // Check if live search provider is configured
    if (!apiKey) {
      return res.status(503).json({
        error: 'Live public-web research is currently unavailable — search provider API key not configured.',
        code: 'API_KEY_MISSING'
      });
    }

    // Formulate search target (e.g., handling specific requests like IndiaMART)
    let refinedQuery = query;
    if (query.toLowerCase().includes('indiamart')) {
      refinedQuery = `site:indiamart.com ${query}`;
    }

    // Call external public web search API (Google Custom Search API example)
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(searchEngineId || '')}&q=${encodeURIComponent(refinedQuery)}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.error) {
      return res.status(502).json({
        error: `Search provider error: ${data.error.message}`,
        code: 'PROVIDER_ERROR'
      });
    }

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({
        results: [],
        message: 'No relevant public information was found.'
      });
    }

    // Extract real public results safely
    const formattedResults = data.items.map((item, index) => ({
      id: `live-res-${index + 1}`,
      productName: item.title || 'Public Commerce Result',
      sourceName: item.displayLink || 'Public Web Source',
      sourceCountry: query.toLowerCase().includes('india') ? 'India / International' : 'Global Source',
      destinationRelevance: 'International Trade Source',
      listedPrice: 'Public Listing Available Online',
      currency: 'Original Source Currency',
      moq: 'Check source listing details',
      sourceType: 'Public Web Search Index',
      status: 'PUBLIC SOURCE',
      originalUrl: item.link,
      snippet: item.snippet || 'No snippet description available.',
      retrievedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      analysisData: {
        sourcePriceRange: 'Varies on original website',
        estimatedCosts: 'Calculated at checkout or direct inquiry',
        marketInfo: 'Retrieved from live public web index records.',
        risks: 'Independent verification of supplier credentials and samples is strongly recommended.',
        questions: ['What is your exact quotation?', 'What are the delivery terms?']
      }
    }));

    return res.json({ results: formattedResults });

  } catch (err) {
    console.error('Search route error:', err);
    return res.status(500).json({
      error: 'Live public-web research is currently unavailable due to a server error.',
      code: 'SERVER_ERROR'
    });
  }
});

app.listen(PORT, () => {
  console.log(`PiNexusCommerce gateway running on port ${PORT}`);
});

