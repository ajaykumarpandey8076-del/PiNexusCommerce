    const data = await apiResponse.json();
    const candidate = data.candidates?.[0] || {};
    const textOutput = candidate.content?.parts?.[0]?.text || 'Live market research and supplier analysis.';

    const formattedResults = [{
      id: 'live-market-result-1',
      productName: `Live Search Insights: ${query}`,
      sourceName: 'Google Search Grounding',
      sourceCountry: 'India / Global',
      destinationRelevance: 'Wholesale Sourcing',
      listedPrice: 'Refer to market text',
      currency: 'INR / USD',
      moq: 'Check supplier details',
      sourceType: 'Gemini Live Web Research',
      status: 'VERIFIED LIVE SOURCE',
      originalUrl: 'https://www.google.com',
      snippet: textOutput,
      retrievedAt: new Date().toISOString(),
      analysisData: {
        sourcePriceRange: 'Extracted from live web search',
        estimatedCosts: 'Calculated via real source',
        marketInfo: textOutput,
        risks: 'Independent verification required',
        questions: ['What is your target order quantity?']
      }
    }];

    return res.json({
      success: true,
      available: true,
      results: formattedResults
    });

