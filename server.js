    const candidate = data.candidates?.[0] || {};
    const textOutput = candidate.content?.parts?.[0]?.text || '';
    
    // 1. Direct extraction from Google Search grounding metadata
    const groundingMetadata = candidate.groundingMetadata || {};
    const groundingChunks = groundingMetadata.groundingChunks || [];

    let sourceUrl = null;
    let sourceTitle = null;
    let grounded = false;

    if (groundingChunks.length > 0) {
      const validChunk = groundingChunks.find(chunk => chunk.web && chunk.web.uri);
      if (validChunk && validChunk.web) {
        sourceUrl = validChunk.web.uri;
        sourceTitle = validChunk.web.title || 'Official Source';
        grounded = true;
      }
    }

    let formattedResults = [];

    if (grounded && sourceUrl) {
      formattedResults.push({
        id: 'grounded-source-1',
        productName: sourceTitle,
        sourceName: new URL(sourceUrl).hostname,
        sourceCountry: 'India / Global',
        destinationRelevance: 'Official Sourcing Link',
        listedPrice: 'Not publicly available',
        currency: 'INR / USD',
        moq: 'Not publicly available',
        sourceType: 'Google Search Grounding',
        status: 'VERIFIED LIVE SOURCE',
        // Structured fields required by frontend
        sourceTitle: sourceTitle,
        sourceUrl: sourceUrl,
        sourceSnippet: textOutput,
        sourceType: 'Google Search Grounding',
        grounded: true,
        originalUrl: sourceUrl, // backward compatibility
        snippet: textOutput,
        retrievedAt: new Date().toISOString()
      });
    } else {
      // If no valid grounding URL exists, return clean null state without fake URLs
      formattedResults.push({
        id: 'grounded-analysis-1',
        productName: `Market Analysis: ${query}`,
        sourceName: 'Source URL: NOT AVAILABLE',
        sourceCountry: 'India / Global',
        destinationRelevance: 'Wholesale Sourcing',
        listedPrice: 'Not publicly available',
        currency: 'INR / USD',
        moq: 'Not publicly available',
        sourceType: 'Google Search Grounding',
        status: null, // No verified badge when URL is missing
        sourceTitle: null,
        sourceUrl: null,
        sourceSnippet: textOutput,
        sourceType: 'Google Search Grounding',
        grounded: false,
        originalUrl: null,
        snippet: textOutput,
        retrievedAt: new Date().toISOString()
      });
    }

