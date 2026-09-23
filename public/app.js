document.addEventListener('click', function(e) {
  const target = e.target.closest('a');
  if (target && target.href && (target.href.includes('google.com/search') || target.href.includes('NOT%20AVAILABLE'))) {
    e.preventDefault();
    alert('Verified source URL is not available. Redirection blocked.');
    return false;
  }
}, true);

function renderResults(results) {
  const container = document.getElementById('real-sources-container');
  if (!container) return;

  if (!results || results.length === 0) {
    container.innerHTML = `
      <div class="bg-white border border-gray-200 rounded-2xl p-6 text-center text-xs text-gray-500">
        No relevant public information was found.
      </div>
    `;
    return;
  }

  container.innerHTML = results.map(item => {
    const validUrl = item.sourceUrl || item.originalUrl;
    
    let actionButtonHtml = '';
    if (validUrl && validUrl.startsWith('http') && !validUrl.includes('google.com/search')) {
      actionButtonHtml = `
        <a href="${validUrl}" target="_blank" rel="noopener noreferrer" class="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-xl text-xs transition">
          Open Original Website
        </a>
      `;
    } else {
      actionButtonHtml = `
        <button type="button" disabled class="inline-block bg-gray-200 text-gray-400 font-medium px-4 py-2 rounded-xl text-xs cursor-not-allowed">
          Source URL: NOT AVAILABLE
        </button>
      `;
    }

    return `
      <div class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-2">
        <div class="flex justify-between items-start">
          <h3 class="font-bold text-sm text-gray-900">${item.productName || 'Market Source'}</h3>
          <span class="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-semibold">${item.status || 'VERIFIED SOURCE'}</span>
        </div>
        <p class="text-xs text-gray-600 line-clamp-3">${item.snippet || item.sourceSnippet || ''}</p>
        <div class="pt-2 flex items-center justify-between">
          <span class="text-[10px] text-gray-400 truncate max-w-[200px]">${item.sourceName || (validUrl ? new URL(validUrl).hostname : 'Source Unavailable')}</span>
          ${actionButtonHtml}
        </div>
      </div>
    `;
  }).join('');
}

