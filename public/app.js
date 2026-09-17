// ==========================================
// PiNexusCommerce - Core Matching & AI Assistant Logic
// ==========================================

const sampleProducts = [
  {
    id: 1,
    name: 'Smart LED Bulb',
    category: 'Electronics',
    sourceMarket: 'India',
    sourcePrice: 120,
    currency: '₹',
    destinationMarket: 'USA',
    description: 'Energy-efficient smart lighting solution for global markets.',
    verified: false,
    sample: true,
    supplierId: 'SUP-01',
    additionalCost: 30,
    sellingPrice: 280,
    analysis: {
      totalCost: 150,
      sellingRange: '₹280–₹322',
      grossMargin: '₹130 (46.4%)',
      marketInfo: 'High demand observed in USA retail channels.',
      riskFactors: 'Shipping/customs clearance and currency fluctuation variance.',
      alternatives: 'Alternate regional suppliers available upon verification.'
    }
  },
  {
    id: 2,
    name: 'Cotton Tote Bag',
    category: 'Clothing',
    sourceMarket: 'India',
    sourcePrice: 80,
    currency: '₹',
    destinationMarket: 'UAE',
    description: 'Eco-friendly reusable cotton carry bag.',
    verified: false,
    sample: true,
    supplierId: 'SUP-02',
    additionalCost: 20,
    sellingPrice: 180,
    analysis: {
      totalCost: 100,
      sellingRange: '₹180–₹210',
      grossMargin: '₹80 (44.4%)',
      marketInfo: 'High demand observed in UAE retail markets.',
      riskFactors: 'Logistics and local distribution compliance.',
      alternatives: 'Alternate textile suppliers available upon verification.'
    }
  }
];

window.commerceContext = window.commerceContext || {
  product: null,
  category: null,
  quantity: null,
  sourceMarket: null,
  destinationMarket: null,
  budget: null,
  purpose: 'Reselling',
  intent: 'OPPORTUNITY_DISCOVERY'
};

window.chatHistory = window.chatHistory || [];
window.activeAiProduct = window.activeAiProduct || null;

// --- Intent Parser & Requirement Extractor ---
function parseAndExtractRequirements(text) {
  const lower = text.toLowerCase();
  
  if (lower.includes('bulb') || lower.includes('led')) {
    window.commerceContext.product = 'Smart LED Bulb';
    window.commerceContext.category = 'Electronics';
  } else if (lower.includes('bag') || lower.includes('cotton') || lower.includes('tote')) {
    window.commerceContext.product = 'Cotton Tote Bag';
    window.commerceContext.category = 'Clothing';
  }

  const qtyMatch = text.match(/\b(\d+)\s*(pieces|units|pcs|bulb|bag)?/i);
  if (qtyMatch && qtyMatch[1]) {
    window.commerceContext.quantity = parseInt(qtyMatch[1], 10);
  }

  if (lower.includes('from india') || lower.includes('source india')) {
    window.commerceContext.sourceMarket = 'India';
  }

  if (lower.includes('usa') || lower.includes('america') || lower.includes('sell in usa')) {
    window.commerceContext.destinationMarket = 'USA';
  } else if (lower.includes('uae') || lower.includes('dubai') || lower.includes('sell in uae')) {
    window.commerceContext.destinationMarket = 'UAE';
  }
}

function findSmartMatches() {
  return sampleProducts.map(product => {
    let score = 0;
    let matchType = 'Possible Match';

    if (window.commerceContext.product && product.name.toLowerCase().includes(window.commerceContext.product.toLowerCase())) {
      score += 40;
    }
    if (window.commerceContext.sourceMarket && product.sourceMarket.toLowerCase() === window.commerceContext.sourceMarket.toLowerCase()) {
      score += 30;
    }
    if (window.commerceContext.destinationMarket && product.destinationMarket.toLowerCase() === window.commerceContext.destinationMarket.toLowerCase()) {
      score += 30;
    }

    if (score >= 70) matchType = 'High Relevance';
    else if (score >= 40) matchType = 'Good Match';

    return { product, score, matchType };
  }).sort((a, b) => b.score - a.score);
}

// --- Render Opportunities (Product Cards) ---
function loadOpportunities(productsToDisplay = sampleProducts) {
  let container = document.getElementById('opportunities-container');
  if (!container) return;

  container.innerHTML = productsToDisplay.map(p => `
    <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
      <div class="flex justify-between items-start mb-2">
        <span class="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
          ⚡ Sample Opportunity
        </span>
        <span class="text-xs font-medium bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full">
          ${p.category}
        </span>
      </div>
      
      <h3 class="font-bold text-gray-900 text-base mb-1.5">${p.name}</h3>
      <p class="text-xs text-gray-600 mb-3 leading-relaxed">${p.description}</p>
      
      <div class="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 space-y-1.5 mb-4 border border-gray-100">
        <div class="flex justify-between">
          <span class="text-gray-500">Source Market:</span>
          <span class="font-medium">${p.sourceMarket} (${p.currency}${p.sourcePrice})</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Destination Target:</span>
          <span class="font-medium">${p.destinationMarket}</span>
        </div>
      </div>

      <div class="flex flex-col gap-2.5 pt-1">
        <button onclick="openAiAdvisorPermission(${p.id})" class="w-full bg-purple-600 text-white py-2.5 px-4 rounded-xl text-xs font-medium hover:bg-purple-700 transition shadow-sm">
          Ask AI Advisor (Analysis Permission)
        </button>
        <button onclick="prepareOrder(${p.id})" class="w-full bg-gray-900 text-white py-2.5 px-4 rounded-xl text-xs font-medium hover:bg-gray-800 transition shadow-sm">
          🔒 Proceed to Order / Pi Payment
        </button>
      </div>

      <div id="ai-advisor-box-${p.id}" class="mt-3"></div>
    </div>
  `).join('');
}

// --- Render AI Commerce Assistant Widget ---
function renderCommerceAssistant() {
  let assistantContainer = document.getElementById('commerce-assistant-container');
  if (!assistantContainer) return;

  assistantContainer.className = 'bg-white border border-purple-100 rounded-2xl p-4 shadow-sm my-4';
  assistantContainer.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-bold text-gray-800 text-xs flex items-center gap-1.5">
        🤖 AI Commerce Assistant
      </h3>
      <button onclick="resetCommerceRequest()" class="text-[10px] text-purple-600 hover:underline font-medium">
        Start New Request
      </button>
    </div>

    <p class="text-[11px] text-gray-500 mb-2">Voice + Text Commerce Matcher</p>

    <div id="chat-messages" class="space-y-1.5 mb-2 max-h-32 overflow-y-auto text-[11px] bg-gray-50 p-2.5 rounded-xl border border-gray-100">
      ${window.chatHistory.length === 0 ? '<p class="text-gray-400 italic">"Type or speak your requirement..."</p>' : 
        window.chatHistory.map(msg => `<div><strong>${msg.sender}:</strong>${msg.text}</div>`).join('')}
    </div>

    <!-- Hidden by default -->
    <div id="voice-status" style="display: none;" class="text-[10px] text-red-600 font-semibold mb-2 animate-pulse">🔴 Listening... Speak now.</div>

    <div class="flex gap-2 items-center">
      <input type="text" id="assistantInput" placeholder="Type what you need..." class="flex-1 p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-purple-600" />
      <button onclick="handleUserSubmit()" class="bg-purple-600 text-white px-3.5 py-2.5 rounded-xl text-xs font-medium hover:bg-purple-700 transition">
        Send
      </button>
      <button onclick="toggleVoiceRecording()" id="mic-btn" class="bg-gray-100 hover:bg-purple-100 text-gray-700 px-3 py-2.5 rounded-xl text-xs transition" title="Voice Command">
        🎙️ Voice
      </button>
    </div>

    <div id="smart-matches-results" class="mt-2"></div>
  `;
}

// --- Voice Recognition Handler ---
let recognition = null;
function toggleVoiceRecording() {
  const statusEl = document.getElementById('voice-status');
  const inputEl = document.getElementById('assistantInput');

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Speech recognition is not supported in your browser. Please use text input.');
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
    inputEl.value = speechText;
    if (statusEl) {
      statusEl.style.display = 'none';
      statusEl.classList.add('hidden');
    }
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

function handleUserSubmit() {
  const inputEl = document.getElementById('assistantInput');
  const text = inputEl.value.trim();
  if (!text) return;

  window.chatHistory.push({ sender: 'You', text: text });
  inputEl.value = '';

  parseAndExtractRequirements(text);

  let aiReply = `Requirement understood. Product: ${window.commerceContext.product || 'General'}, Source: ${window.commerceContext.sourceMarket || 'Any'}, Destination: ${window.commerceContext.destinationMarket || 'Any'}. Matching with verified suppliers...`;
  window.chatHistory.push({ sender: 'AI', text: aiReply });

  renderCommerceAssistant();
  renderSmartMatches();
}

function renderSmartMatches() {
  const container = document.getElementById('smart-matches-results');
  if (!container) return;

  const matches = findSmartMatches();
  container.innerHTML = `
    <div class="mt-2 pt-2 border-t border-gray-100">
      <h4 class="font-semibold text-gray-800 text-xs mb-1.5">🎯 Matching Opportunities</h4>
      <div class="space-y-1.5">
        ${matches.map(m => `
          <div class="bg-white p-2 rounded-lg border border-gray-100 text-[11px] flex justify-between items-center">
            <div>
              <span class="font-bold text-gray-800">${m.product.name}</span>
              <span class="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded ml-1">${m.matchType}</span>
            </div>
            <button onclick="loadOpportunities([sampleProducts.find(p => p.id === ${m.product.id})])" class="bg-purple-600 text-white px-2.5 py-1 rounded text-[10px] font-medium">
              View
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function resetCommerceRequest() {
  window.commerceContext = {
    product: null,
    category: null,
    quantity: null,
    sourceMarket: null,
    destinationMarket: null,
    budget: null,
    purpose: 'Reselling',
    intent: 'OPPORTUNITY_DISCOVERY'
  };
  window.chatHistory = [];
  renderCommerceAssistant();
  loadOpportunities(sampleProducts);
}

// --- Permission-Gated AI Advisor Flow ---
function openAiAdvisorPermission(productId) {
  const product = sampleProducts.find(p => p.id === productId);
  if (!product) return;

  window.activeAiProduct = { id: productId, state: 'permission' };
  renderProductAiAdvisor(product);
}

function renderProductAiAdvisor(product) {
  sampleProducts.forEach(p => {
    const box = document.getElementById(`ai-advisor-box-${p.id}`);
    if (box) box.innerHTML = '';
  });

  const targetBox = document.getElementById(`ai-advisor-box-${product.id}`);
  if (!targetBox) return;

  if (window.activeAiProduct && window.activeAiProduct.state === 'permission') {
    targetBox.innerHTML = `
      <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 mt-3 shadow-sm">
        <h4 class="font-bold text-gray-800 text-xs mb-1">AI Business Advisor</h4>
        <p class="text-xs text-gray-700 mb-3">
          “Would you like me to provide a detailed analysis of this product (${product.name})?”
        </p>
        <div class="flex flex-col gap-2">
          <button onclick="showProductAnalysis(${product.id})" class="w-full bg-purple-600 text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-purple-700 transition">
            Yes, Show Analysis
          </button>
          <button onclick="closeProductAi(${product.id})" class="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-xs font-medium hover:bg-gray-200 transition">
            No, Not Now
          </button>
        </div>
      </div>
    `;
  } else if (window.activeAiProduct && window.activeAiProduct.state === 'analysis') {
    const a = product.analysis;
    targetBox.innerHTML = `
      <div class="bg-white border border-purple-200 rounded-xl p-4 mt-3 shadow-md">
        <h4 class="font-bold text-gray-800 text-xs mb-1">AI Business Advisor</h4>
        <h5 class="font-semibold text-purple-700 text-xs mb-2">Detailed Estimate Analysis (${product.name})</h5>
        
        <div class="text-[11px] text-gray-600 space-y-1 mb-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          <div><strong>Source Price:</strong> ${product.currency}${product.sourcePrice}</div>
          <div><strong>Estimated Cost:</strong> ₹${a.totalCost}</div>
          <div><strong>Selling Price Range:</strong> ${a.sellingRange}</div>
          <div><strong>Estimated Gross Margin:</strong> ${a.grossMargin}</div>
          <div><strong>Market Info:</strong> ${a.marketInfo}</div>
          <div><strong>Risk Factors:</strong> ${a.riskFactors}</div>
        </div>

        <p class="text-[9px] text-gray-400 italic mb-3">
          "AI estimates are for reference only. Final commercial decisions rest solely with the user."
        </p>

        <div class="flex flex-col gap-2">
          <button onclick="prepareOrder(${product.id})" class="w-full bg-purple-600 text-white py-2.5 px-3 rounded-lg font-semibold text-xs hover:bg-purple-700 transition">
            🔒 Proceed to Order / Pi Payment
          </button>
          <button onclick="closeProductAi(${product.id})" class="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-lg font-medium text-xs">
            Close
          </button>
        </div>
      </div>
    `;
  }
}

function showProductAnalysis(productId) {
  const product = sampleProducts.find(p => p.id === productId);
  if (!product) return;
  window.activeAiProduct = { id: productId, state: 'analysis' };
  renderProductAiAdvisor(product);
}

function closeProductAi(productId) {
  window.activeAiProduct = null;
  const targetBox = document.getElementById(`ai-advisor-box-${productId}`);
  if (targetBox) targetBox.innerHTML = '';
}

// --- Margin Calculator ---
function calculateMargin() {
  const src = parseFloat(document.getElementById('sourcePrice')?.value) || 0;
  const add = parseFloat(document.getElementById('additionalCost')?.value) || 0;
  const sell = parseFloat(document.getElementById('sellingPrice')?.value) || 0;

  const totalCost = src + add;
  const grossMargin = sell - totalCost;
  const marginPct = sell > 0 ? ((grossMargin / sell) * 100).toFixed(1) : 0;

  const resultEl = document.getElementById('calcResult');
  if (resultEl) {
    resultEl.innerHTML = `Total Cost: ₹${totalCost} | Gross Margin: ₹${grossMargin} (${marginPct}%)`;
  }
}

// --- Navigation & Role Handling ---
function selectRole(role) {
  localStorage.setItem('piNexusRole', role);
}

function loadSavedRole() {
  const saved = localStorage.getItem('piNexusRole') || 'Buyer';
  const el = document.getElementById('roleSelect');
  if (el) el.value = saved;
}

function switchTab(tabName) {
  const tabs = ['home', 'discover', 'advisor', 'orders', 'profile'];
  tabs.forEach(t => {
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

// --- Order / Pi Payment Flow ---
function prepareOrder(productId) {
  const product = sampleProducts.find(p => p.id === productId);
  alert(`Initiating official Pi Testnet payment flow for ${product ? product.name : 'product'}. Note: Final transaction confirmation requires authorized Pi wallet interaction.`);
}

function searchOpportunities() {
  const query = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const filtered = sampleProducts.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.category.toLowerCase().includes(query) ||
    p.sourceMarket.toLowerCase().includes(query) ||
    p.destinationMarket.toLowerCase().includes(query)
  );
  loadOpportunities(filtered);
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  loadSavedRole();
  switchTab('home');
  loadOpportunities(sampleProducts);
  renderCommerceAssistant();
});
