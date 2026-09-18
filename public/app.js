// ==========================================
// PiNexusCommerce - Live Public Web Research App Logic
// ==========================================

window.commerceContext = window.commerceContext || {
  product: null,
  intent: null,
  quantity: null,
  sourceCountry: null,
  destinationCountry: null,
  status: 'COLLECTING'
};

window.chatHistory = window.chatHistory || [];
window.currentSearchResults = window.currentSearchResults || [];

// --- Trigger Live Backend Public Search ---
async function processUserCommerceQuery(queryText) {
  if (!queryText) return;
  
  window.chatHistory.push({ sender: 'You', text: queryText });
  updateAssistantUI();

  const container = document.getElementById('real-sources-container');
  if (container) {
    container.innerHTML = `
      <div class="bg-white border border-gray-200 rounded-2xl p-6 text-center space-y-2 shadow-sm animate-pulse">
        <span class="text-xl">🌐</span>
        <p class="text-xs font-semibold text-purple-700">Searching live public web sources...</p>
        <p class="text-[10px] text-gray-400">Querying verified public directories & web indexes...</p>
      </div>
    `;
  }

  try {
    const response = await fetch('/api/search-commerce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: queryText })
    });

    const data = await response.json();

    if (!response.ok) {
      renderErrorState(data.error || 'Live public-web research is currently unavailable.');
      window.chatHistory.push({ sender: 'AI', text: data.error || 'Search unavailable.' });
      updateAssistantUI();
      return;
    }

    window.currentSearchResults = data.results || [];
    renderRealSources(window.currentSearchResults);
    window.chatHistory.push({ sender: 'AI', text: `Found ${window.currentSearchResults.length} public result(s) for your request.` });
    updateAssistantUI();

  } catch (err) {
    console.error('Search request failed:', err);
    renderErrorState('Live public-web research is currently unavailable — network or server error.');
    window.chatHistory.push({ sender: 'AI', text: 'Live public-web research is currently unavailable.' });
    updateAssistantUI();
  }
}

// --- Render Real Source Results ---
function renderRealSources(results) {
  const container = document.getElementById('real-sources-container');
  if (!container) return;

  if (!results || results.length === 0) {
    container.innerHTML = `
      <div class="bg-white border border-gray-200 rounded-2xl p-6 text-center space-y-3 shadow-sm">
        <span class="text-2xl">🔍</span>
        <h3 class="font-bold text-sm text-gray-900">No relevant public information was found.</h3>
        <p class="text-xs text-gray-600 leading-relaxed">No public web records matched your specific parameters under the Reality-First policy.</p>
        <div class="flex flex-col gap-2 pt-2">
          <button type="button" onclick="resetCommerceRequest()" class="bg-purple-600 text-white py-2 rounded-xl text-xs font-medium hover:bg-purple-700 transition">Try Another Search</button>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = results.map(res => `
    <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
      <div class="flex justify-between items-start">
        <span class="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
          ${res.status}
        </span>
        <span class="text-[10px] font-medium bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
          ${res.sourceName}
        </span>
      </div>

      <div>
        <h3 class="font-bold text-gray-900 text-base">${res.productName}</h3>
        <p class="text-xs text-gray-600 mt-1 leading-relaxed">${res.snippet}</p>
      </div>

      <div class="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 space-y-1 border border-gray-100">
        <div class="flex justify-between">
          <span class="text-gray-500">Source:</span>
          <span class="font-medium">${res.sourceName}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Price / MOQ:</span>
          <span class="font-medium">${res.listedPrice} | MOQ: ${res.moq}</span>
        </div>
        <div class="flex justify-between text-[10px] text-gray-400 pt-1">
          <span>Observed:</span>
          <span>${res.retrievedAt}</span>
        </div>
      </div>

      <div class="flex flex-col gap-2 pt-1">
        <button type="button" onclick="requestAiAnalysis('${res.id}')" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-xl text-xs font-medium transition shadow-sm">
          Ask AI Advisor (Detailed Analysis)
        </button>
        <a href="${res.originalUrl}" target="_blank" rel="noopener noreferrer" class="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 px-4 rounded-xl text-xs font-medium text-center transition shadow-sm block">
          Open Original Website ↗
        </a>
      </div>

      <div id="ai-analysis-box-${res.id}" class="mt-2"></div>
    </div>
  `).join('');
}

function renderErrorState(errorMessage) {
  const container = document.getElementById('real-sources-container');
  if (!container) return;

  container.innerHTML = `
    <div class="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3 shadow-sm">
      <span class="text-2xl">⚠️</span>
      <h3 class="font-bold text-sm text-amber-900">Live Research Status Notice</h3>
      <p class="text-xs text-amber-800 leading-relaxed">${errorMessage}</p>
      <p class="text-[10px] text-gray-500 italic pt-1">Note: A server search API key (` + "`SEARCH_PROVIDER_API_KEY`" + `) is required in environment settings for live web queries.</p>
    </div>
  `;
}

// --- Permission-First AI Analysis Flow ---
function requestAiAnalysis(sourceId) {
  const box = document.getElementById(`ai-analysis-box-${sourceId}`);
  if (!box) return;

  box.innerHTML = `
    <div class="bg-purple-50 border border-purple-200 rounded-xl p-3 mt-3 text-xs space-y-2">
      <p class="font-bold text-purple-900">AI Business Advisor Permission</p>
      <p class="text-gray-700">Would you like me to provide a detailed analysis of this product/source?</p>
      <div class="flex gap-2 pt-1">
        <button type="button" onclick="showConfirmedAnalysis('${sourceId}')" class="flex-1 bg-purple-600 text-white py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-purple-700 transition">
          [Yes, Show Analysis]
        </button>
        <button type="button" onclick="cancelAiAnalysis('${sourceId}')" class="bg-gray-200 text-gray-700 py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-gray-300 transition">
          [No, Not Now]
        </button>
      </div>
    </div>
  `;
}

function showConfirmedAnalysis(sourceId) {
  const res = window.currentSearchResults.find(r => r.id === sourceId);
  const box = document.getElementById(`ai-analysis-box-${sourceId}`);
  if (!res || !box) return;

  const a = res.analysisData;
  box.innerHTML = `
    <div class="bg-white border border-purple-300 rounded-xl p-3 mt-3 text-xs space-y-2 shadow-inner">
      <p class="font-bold text-purple-900">📊 ESTIMATED / AI ANALYSIS</p>
      <div class="space-y-1 text-gray-700 text-[11px] bg-gray-50 p-2 rounded-lg border">
        <div><strong>Source Price Range:</strong> ${a.sourcePriceRange}</div>
        <div><strong>Estimated Logistics:</strong> ${a.estimatedCosts}</div>
        <div><strong>Market Outlook:</strong> ${a.marketInfo}</div>
        <div><strong>Risk Factors:</strong> ${a.risks}</div>
        <div><strong>Key Questions for Supplier:</strong>
          <ul class="list-disc pl-4 pt-0.5 text-gray-600">
            ${a.questions.map(q => `<li>${q}</li>`).join('')}
          </ul>
        </div>
      </div>
      <p class="text-[9px] text-gray-400 italic">"Information is based on available public/user-provided data and estimates. Actual prices, costs and market conditions may change. The final decision is yours."</p>
      <button type="button" onclick="cancelAiAnalysis('${sourceId}')" class="w-full bg-gray-100 text-gray-700 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-200">Close Analysis</button>
    </div>
  `;
}

function cancelAiAnalysis(sourceId) {
  const box = document.getElementById(`ai-analysis-box-${sourceId}`);
  if (box) box.innerHTML = '';
}

// --- UI Helpers & Chat ---
function updateAssistantUI() {
  const chatBox = document.getElementById('chat-messages');
  if (!chatBox) return;

  chatBox.innerHTML = window.chatHistory.length === 0 
    ? '<p class="text-gray-400 italic">"What do you want to buy, sell, or research today?"</p>'
    : window.chatHistory.map(msg => `<div><strong>${msg.sender}:</strong> ${msg.text}</div>`).join('');
  
  chatBox.scrollTop = chatBox.scrollHeight;
}

function resetCommerceRequest() {
  window.chatHistory = [];
  window.currentSearchResults = [];
  updateAssistantUI();
  const container = document.getElementById('real-sources-container');
  if (container) {
    container.innerHTML = `
      <div class="bg-white border border-gray-200 rounded-2xl p-6 text-center text-xs text-gray-500">
        No active search query yet.
      </div>
    `;
  }
}

// --- Voice Recognition Setup ---
let recognition = null;
function toggleVoiceRecording() {
  const statusEl = document.getElementById('voice-status');
  const inputEl = document.getElementById('assistantInput');

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Speech recognition is not supported in your browser.');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.classList.remove('hidden');
  }

  recognition.onresult = (event) => {
    const speechText = event.results[0][0].transcript;
    if (inputEl) inputEl.value = speechText;
    if (statusEl) {
      statusEl.style.display = 'none';
      statusEl.classList.add('hidden');
    }
    processUserCommerceQuery(speechText);
  };

  recognition.onerror = () => {
    if (statusEl) {
      statusEl.style.display = 'none';
      statusEl.classList.add('hidden');
    }
  };

  recognition.onend = () => {
    if (statusEl) {
      statusEl.style.display = 'none';
      statusEl.classList.add('hidden');
    }
  };

  recognition.start();
}

function switchTab(tabName) {
  ['home', 'discover', 'advisor', 'orders', 'profile'].forEach(t => {
    const el = document.getElementById(`tab-${t}`);
    if (el) el.classList.toggle('hidden', t !== tabName);
  });
}

function setActiveNav(btn) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active', 'text-purple-600');
    item.classList.add('text-gray-600');
  });
  btn.classList.add('active', 'text-purple-600');
  btn.classList.remove('text-gray-600');
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    switchTab('home');
    updateAssistantUI();

    document.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[data-tab]');
      if (tabBtn) {
        e.preventDefault();
        const tabName = tabBtn.getAttribute('data-tab');
        switchTab(tabName);
        setActiveNav(tabBtn);
        return;
      }
    });

    document.getElementById('send-chat-btn')?.addEventListener('click', () => {
      const input = document.getElementById('assistantInput');
      if (input && input.value.trim()) {
        const text = input.value.trim();
        input.value = '';
        processUserCommerceQuery(text);
      }
    });

    document.getElementById('assistantInput')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const input = document.getElementById('assistantInput');
        if (input && input.value.trim()) {
          const text = input.value.trim();
          input.value = '';
          processUserCommerceQuery(text);
        }
      }
    });

    document.getElementById('reset-req-btn')?.addEventListener('click', resetCommerceRequest);
    document.getElementById('mic-btn')?.addEventListener('click', toggleVoiceRecording);

  } catch (err) {
    console.error("Initialization error:", err);
  }
});

