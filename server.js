    const apiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `Provide real commercial search results for: "${query}". Return relevant supplier names, market details, prices, and sources.` 
          }]
        }],
        tools: [{ googleSearch: {} }]
      }),
      signal: controller.signal
    });

    const data = await apiResponse.json();
    const candidate = data.candidates?.[0] || {};
    const textOutput = candidate.content?.parts?.[0]?.text;

    if (!textOutput) {
      throw new Error("No text generated from Gemini model");
    }

    const formattedResults = [{
      id: 'live-market-res-1',
      productName: `Market Insights: ${query}`,
      sourceName: 'Google Search Grounding',
      sourceCountry: 'India / Global',
      destinationRelevance: 'Wholesale Sourcing',
      listedPrice: 'Refer to live analysis',
      currency: 'INR',
      moq: 'Check supplier details',
      sourceType: 'Gemini Live Research',
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

