// Result card rendering function ke andar:
const sourceUrl = result.sourceUrl || result.originalUrl;

let websiteButtonHtml = '';
if (sourceUrl && sourceUrl.startsWith('http') && !sourceUrl.includes('google.com/search?q=')) {
  console.log('Opening verified source URL:', sourceUrl);
  websiteButtonHtml = `
    <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" class="open-website-btn">
      Open Original Website
    </a>
  `;
} else {
  // Disable button completely if real sourceUrl is missing or invalid
  websiteButtonHtml = `
    <button type="button" disabled class="open-website-btn disabled" title="Source URL not available from grounding metadata">
      Source URL: NOT AVAILABLE
    </button>
  `;
}

        
