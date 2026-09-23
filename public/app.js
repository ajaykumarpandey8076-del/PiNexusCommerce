document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const container = document.getElementById('real-sources-container');

  if (searchForm) {
    searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (!query) return;

      container.innerHTML = `
        <div class="bg-white border border-gray-200 rounded-2xl p-6 text-center text-xs text-purple-600 shadow-sm animate-pulse">
          Searching verified public web sources using Google Search Grounding...
        </div>
      `;

      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });
        const data = await res.json();

        if (!data.success) {
          container.innerHTML = `<div class="bg-white border border-red-200 rounded-2xl p-4 text-center text-xs text-red-600">${data.error}</div>`;
          return;
        }

        if (!data.sources || data.sources.length === 0) {
          container.innerHTML = `<div class="bg-white border border-gray-200 rounded-2xl p-6 text-center text-xs text-gray-500">Live search completed, but no usable public source was returned.</div>`;
          return;
        }

        container.innerHTML = data.sources.map(source => {
          const isValidUrl = source.url && source.url.startsWith('http');
          const badgeText = isValidUrl ? "VERIFIED LIVE SOURCE" : "Google Search Grounding — Source unavailable";
          const badgeClass = isValidUrl ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-500";

          let actionBtn = isValidUrl ? `
            <a href="${source.url}" target="_blank" rel="noopener noreferrer" class="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-xl text-xs transition">
              Open Original Website
            </a>
          ` : `
            <button type="button" disabled class="bg-gray-200 text-gray-400 font-medium px-4 py-2 rounded-xl text-xs cursor-not-allowed">
              Source URL: NOT AVAILABLE
            </button>
          `;

          return `
            <div class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div class="flex justify-between items-start gap-2">
                <h3 class="font-bold text-sm text-gray-900">${source.title}</h3>
                <span class="text-[10px] ${badgeClass} px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">${badgeText}</span>
              </div>
              <p class="text-xs text-gray-600 leading-relaxed">${source.snippet}</p>
              <div class="pt-2 flex items-center justify-between border-t border-gray-100">
                <span class="text-[10px] text-gray-400 truncate max-w-[200px]">${isValidUrl ? new URL(source.url).hostname : 'Not publicly available'}</span>
                ${actionBtn}
              </div>
            </div>
          `;
        }).join('');

      } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="bg-white border border-red-200 rounded-2xl p-4 text-center text-xs text-red-600">Live research is temporarily unavailable. Please try again.</div>`;
      }
    });
  }
});

