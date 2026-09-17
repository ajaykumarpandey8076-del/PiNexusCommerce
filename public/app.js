// ==========================================
// PiNexusCommerce - Bulletproof Stable Application Logic
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
      marketInfo: 'High demand observed in USA.',
      riskFactors: 'Shipping/customs clearance and currency fluctuation variance.',
      alternatives: 'Alternate regional suppliers available on verification.'
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
      alternatives: 'Alternate textile suppliers available on verification.'
    }
  }
];

// --- Authorized Real Supplier Data Source Registry ---
window.verifiedSupplierDatabase = window.verifiedSupplierDatabase || [];

// --- Isolated State Management ---
window.commerceRequirement = window.commerceRequirement || {
  product: null,
  category: null,
  quantity: null,
  unit: null,
  sourceCountry: null,
  destinationCountry: null,
  purpose: null,
  budget: null,
  targetPrice: null,
  qualityRequirements: null,
  shippingRequirement: null,
  urgency: null,
  additionalRequirements: null,
  status: 'COLLECTING'
};

window.chatHistory = window.chatHistory || [];
window.activeAiProduct = window.activeAiProduct || null;
window.matchingSearchResults = window.matchingSearchResults || null;

// --- Phase 1: Intent Parser & State Updater ---
function parseAndExtractRequirements(text) {
  if (!text) return;
  const lower = text.toLowerCase();

  const qtyMatch = text.match(/\b(\d+)\s*(pieces|units|pcs|bulb|bulbs|bag|bags|shoes|pairs)?/i);
  if (qtyMatch && qtyMatch[1]) {
    window.commerceRequirement.quantity = parseInt(qtyMatch[1], 10);
  }

  if (lower.includes('bulb') || lower.includes('led')) {
    window.commerceRequirement.product = 'LED Bulb';
    window.commerceRequirement.category = 'Electronics';
  } else if (lower.includes('bag') || lower.includes('cotton') || lower.includes('tote')) {
    window.commerceRequirement.product = 'Cotton Tote Bag';
    window.commerceRequirement.category = 'Clothing';
  } else if (lower.includes('shoe') || lower.includes('shoes')) {
    window.commerceRequirement.product = 'Shoes';
    window.commerceRequirement.category = 'Footwear';
  }

  if (lower.includes('india') || lower.includes('se india') || lower.includes('from india')) {
    window.commerceRequirement.sourceCountry = 'India';
  }

  if (lower.includes('uae') || lower.includes('dubai') || lower.includes('mein uae')) {
    window.commerceRequirement.destinationCountry = 'UAE';
  } else if (lower.includes('usa') || lower.includes('america') || lower.includes('mein usa')) {
    window.commerceRequirement.destinationCountry = 'USA';
  }

  if (lower.includes('bechne') || lower.includes('sell') || lower.includes('resale') || lower.includes('business')) {
    window.commerceRequirement.purpose = 'Resale';
  } else if (lower.includes('wholesale') || lower.includes('saste rate')) {
    window.commerceRequirement.purpose = 'Wholesale Sourcing';
  } else if (lower.includes('personal')) {
    window.commerceRequirement.purpose = 'Personal Purchase';
  }
}

function getNextClarifyingQuestion() {
  const req = window.commerceRequirement;
  if (!req.product && !req.category) {
    return "आप किस product या category की तलाश कर रहे हैं?";
  }
  if (!req.quantity) {
    return `आपको ${req.product || 'इस item'} की कितनी quantity चाहिए?`;
  }
  if (!req.sourceCountry) {
    return `आप इसे किस country से source करना चाहते हैं?`;
  }
  if (!req.destinationCountry) {
    return `आप इसे किस country या market में sell या use करना चाहते हैं?`;
  }
  return null;
}

// --- Phase 2: Modular Matching Engine ---
function executeSupplierMatchingEngine(requirement) {
  const db = window.verifiedSupplierDatabase;
  if (!db || db.length === 0) {
    return { matches: [], status: 'NO_SOURCES_CONNECTED' };
  }

  let results = db.map(supplier => {
    let score = 0;
    let matchType = 'Limited Match';

    if (requirement.product && supplier.product.toLowerCase().includes(requirement.product.toLowerCase())) {
      score += 40;
    }
    if (requirement.sourceCountry && supplier.sourceCountry.toLowerCase() === requirement.sourceCountry.toLowerCase()) {
      score += 25;
    }
    if (requirement.destinationCountry && supplier.destinationCountry.toLowerCase() === requirement.destinationCountry.toLowerCase()) {
      score += 25;
    }

    if (score >= 75) matchType = 'Strong Match';
    else if (score >= 45) matchType = 'Relevant Match';

    return { supplier, score, matchType };
  }).filter(m => m.score >= 40).sort((a, b) => b.score - a.score);

  return { matches: results, status: results.length > 0 ? 'MATCHES_FOUND' : 'NO_MATCH' };
}

// --- Render AI Commerce Assistant Widget (Independent State) ---
function renderCommerceAssistant() {
  let assistantContainer = document.getElementById('commerce-assistant-container');
  if (!assistantContainer) return;

  assistantContainer.className = 'bg-white border border-purple-100 rounded-2xl p-4 shadow-sm my-4';

  let summaryHtml = '';
  const req = window.commerceRequirement;

  if (req.status === 'CONFIRMED') {
    let matchOutputHtml = '';
    if (window.matchingSearchResults) {
      if (window.matchingSearchResults.status === 'NO_SOURCES_CONNECTED' || window.matchingSearchResults.matches.length === 0) {
        matchOutputHtml = `
          <div class="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-center text-xs text-gray-600">
            <p class="font-semibold text-gray-800 mb-1">🔍 Phase 2 Supplier Matching Results</p>
            <p class="text-gray-500 italic">"No verified supplier match found from current sources."</p>
            <p class="text-[10px] text-gray-400 mt-1">Real supplier data connection required.</p>
          </div>
        `;
      }
    }

    summaryHtml = `
      <div class="bg-purple-50 border border-purple-200 rounded-xl p-3 my-2 text-xs">
        <p class="font-bold text-purple-900 mb-1">✅ Requirement Ready</p>
        <div class="text-gray-700 space-y-0.5 text-[11px] mb-2">
          <div><strong>Product:</strong> ${req.product || 'N/A'}</div>
          <div><strong>Quantity:</strong> ${req.quantity || 'N/A'}</div>
          <div><strong>Source:</strong> ${req.sourceCountry || 'Not specified'}</div>
          <div><strong>Destination:</strong> ${req.destinationCountry || 'Not specified'}</div>
          <div><strong>Purpose:</strong> ${req.purpose || 'General Sourcing'}</div>
        </div>
        
        <div class="flex gap-2 mt-2">
          <button onclick="triggerPhase2Matching()" class="flex-1 bg-purple-600 text-white py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-purple-700 transition shadow-sm">
            Find Supplier Matches
          </button>
          <button onclick="editRequirement()" class="bg-gray-200 text-gray-700 py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-gray-300 transition">
            Edit Requirement
          </button>
        </div>

        ${matchOutputHtml}
      </div>
    `;
  } else if (req.product && req.quantity && req.destinationCountry) {
    summaryHtml = `
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 my-2 text-xs">
        <p class="font-bold text-amber-900 mb-1">मैंने आपकी आवश्यकता इस प्रकार समझी है:</p>
        <div class="text-gray-700 space-y-0.5 text-[11px] mb-2">
          <div>Product: ${req.product}</div>
          <div>Quantity: ${req.quantity}</div>
          <div>Source: ${req.sourceCountry || 'Not specified'}</div>
          <div>Destination: ${req.destinationCountry}</div>
          <div>Purpose: ${req.purpose || 'Resale'}</div>
        </div>
        <div class="flex gap-2">
          <button onclick="confirmRequirement()" class="flex-1 bg-purple-600 text-white py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-purple-700 transition">
            [Confirm Requirement]
          </button>
          <button onclick="editRequirement()" class="bg-gray-200 text-gray-700 py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-gray-300 transition">
            [Edit Requirement]
          </button>
        </div>
      </div>
    `;
  }

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

    <div id="chat-messages" class="space-y-1.5 mb-2 max-h-36 overflow-y-auto text-[11px] bg-gray-50 p-2.5 rounded-xl border border-gray-100">
      ${window.chatHistory.length === 0 ? '<p class="text-gray-400 italic">"Type or speak your requirement..."</p>' : 
        window.chatHistory.map(msg => `<div><strong>${msg.sender}:</strong>${msg.text}</div>`).join('')}
    </div>

    ${summaryHtml}

    <div id="voice-status" style="display: none;" class="text-[10px] text-red-600 font-semibold mb-2 animate-pulse">🔴 Listening... Speak now.</div>

    <div class="flex gap-2 items-center">
      <input type="text" id="assistantInput" placeholder="Type what you need..." class="flex-1 p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-purple-600" onkeydown="if(event.key==='Enter') handleUserSubmit()" />
      <button onclick="handleUserSubmit()" class="bg-purple-600 text-white px-3.5 py-2.5 rounded-xl text-xs font-medium hover:bg-purple-700 transition">
        Send
      </button>
      <button onclick="toggleVoiceRecording()" id="mic-btn" class="bg-gray-100 hover:bg-purple-100 text-gray-700 px-3 py-2.5 rounded-xl text-xs transition" title="Voice Command">
        🎙️ Voice
      </button>
    </div>
  `;
}

function triggerPhase2Matching() {
  window.chatHistory.push({ sender: 'AI', text: 'Searching available supplier sources...' });
  renderCommerceAssistant();

  setTimeout(() => {
    window.matchingSearchResults = executeSupplierMatchingEngine(window.commerceRequirement);
    window.chatHistory.push({ sender: 'AI', text: 'No verified supplier match found from current sources.' });
    renderCommerceAssistant();
  }, 600);
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
    handleUserSubmit();
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
  if (!inputEl) return;
  const text = inputEl.value.trim();
  if (!text) return;

  window.chatHistory.push({ sender: 'You', text: text });
  inputEl.value = '';

  parseAndExtractRequirements(text);

  const nextQ = getNextClarifyingQuestion();
  let aiReply = nextQ ? `मैंने आपकी आवश्यकता नोट कर ली है। ${nextQ}` : `धन्यवाद! आपकी सारी जानकारी मिल गई है। कृपया नीचे दी गई summary देखें।`;

  window.chatHistory.push({ sender: 'AI', text: aiReply });
  renderCommerceAssistant();
}

function confirmRequirement() {
  window.commerceRequirement.status = 'CONFIRMED';
  window.matchingSearchResults = null;
  window.chatHistory.push({ sender: 'AI', text: `Requirement Ready. Click "Find Supplier Matches" to search connected supplier databases.` });
  renderCommerceAssistant();
}

function editRequirement() {
  window.commerceRequirement.status = 'COLLECTING';
  window.matchingSearchResults = null;
  window.chatHistory.push({ sender: 'AI', text: `ঠিক है, आप अपनी आवश्यकता में जो बदलाव करना चाहें बता सकते हैं।` });
  renderCommerceAssistant();
}

function resetCommerceRequest() {
  window.commerceRequirement = {
    product: null,
    category: null,
    quantity: null,
    unit: null,
    sourceCountry: null,
    destinationCountry: null,
    purpose: null,
    budget: null,
    targetPrice: null,
    qualityRequirements: null,
    shippingRequirement: null,
    urgency: null,
    additionalRequirements: null,
    status: 'COLLECTING'
  };
  window.chatHistory = [];
  window.matchingSearchResults = null;
  renderCommerceAssistant();
}

// --- Render Today's Opportunities (Product Cards) ---
function loadOpportunities(productsToDisplay = sampleProducts) {
  let container = document.getElementById('opportunities-container');
  if (!container) return;

  container.innerHTML = productsToDisplay.map(p => `
    <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-4 transition-all hover:shadow-md">
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
          Ask AI Advisor
        </button>
        <button onclick="prepareOrder(${p.id})" class="w-full bg-gray-900 text-white py-2.5 px-4 rounded-xl text-xs font-medium hover:bg-gray-800 transition shadow-sm">
          🔒 Proceed to Order / Pi Payment
        </button>
      </div>

      <div id="ai-advisor-box-${p.id}" class="mt-3"></div>
    </div>
  `).join('');
}

// --- Isolated AI Advisor Permission Flow ---
function openAiAdvisorPermission(productId) {
  const product = sampleProducts.find(p => p.id === productId);
  if (!product) return;

  window.activeAiProduct = { id: productId, state: 'permission' };
  renderProductAiAdvisor(product);
}

function renderProductAiAdvisor(product) {
  sampleProducts.forEach(p => {
    const box = document.getElementById(`ai-advisor-box-${p.id}`);
    if (box && p.id !== product.id) box.innerHTML = '';
  });

  const targetBox = document.getElementById(`ai-advisor-box-${product.id}`);
  if (!targetBox) return;

  if (window.activeAiProduct && window.activeAiProduct.state === 'permission') {
    targetBox.innerHTML = `
      <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 mt-3 shadow-sm">
        <h4 class="font-bold text-gray-800 text-xs mb-1">AI Business Advisor</h4>
        <p class="text-xs text-gray-700 mb-3">
          Would you like me to provide a detailed analysis of this product?
        </p>
        <div class="flex flex-col gap-2">
          <button onclick="showProductAnalysis(${product.id})" class="w-full bg-purple-600 text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-purple-700 transition">
            [Yes, Show Analysis]
          </button>
          <button onclick="closeProductAi(${product.id})" class="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-xs font-medium hover:bg-gray-200 transition">
            [No, Not Now]
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
            No, Not Now
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

// --- Navigation & Role Handling ---
function selectRole(role) {
  localStorage.setItem('piNexusRole', role);
}

function loadSavedRole() {
  const sav
