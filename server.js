const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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

    // Check safely if search credentials/API key are configured
    const apiKey = process.env.SEARCH_PROVIDER_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: false,
        available: false,
        results: [],
        message: 'Live public-web research is currently unavailable because the search provider is not configured.'
      });
    }

    let refinedQuery = query;
    if (query.toLowerCase().includes('india')) {
      refinedQuery = `site:indiamart.com ${query}`;
    }

    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&q=${encodeURIComponent(refinedQuery)}`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.error) {
      return res.status(502).json({
        success: false,
        available: false,
        results: [],
        message: 'Search provider error occurred.'
      });
    }

    if (!data.items || data.items.length === 0) {
      return res.status(200).json({
        success: false,
        available: true,
        results: [],
        message: 'No relevant public listings found.'
      });
    }

    const formattedResults = data.items.map((item, index) => ({
      id: `live-res-${index + 1}`,
      productName: item.title || 'Public Listing',
      sourceName: item.displayLink || 'Web Source',
      sourceCountry: query.toLowerCase().includes('india') ? 'India' : 'International',
      destinationRelevance: 'International',
      listedPrice: 'Public Listing Available',
      currency: 'Original Source Currency',
      moq: 'Check source listing details',
      sourceType: 'Public Web Search Source',
      status: 'PUBLIC SOURCE',
      originalUrl: item.link,
      snippet: item.snippet || 'No snippet available',
      retrievedAt: new Date().toISOString(),
      analysisData: {
        sourcePriceRange: 'Varies on source',
        estimatedCosts: 'Calculated at source',
        marketInfo: 'Retrieved from live search',
        risks: 'Independent verification required',
        questions: ['What is your exact order quantity?']
      }
    }));

    return res.json({
      success: true,
      available: true,
      results: formattedResults
    });

  } catch (err) {
    console.error('Search route error:', err);
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
app.listen(PORT, () => {
  console.log(`PiNexusCommerce gateway running on port ${PORT}`);
});
// Build trigger update - search fix active

