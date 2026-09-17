// ==========================================
// PiNexusCommerce - Phase 1, Phase 2 & Phase 3 Commerce Flow
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
    supplierName: 'ABC Lighting Global (Demo Partner)',
    analysis: {
      totalCost: 150,
      sellingRange: '₹280–₹322',
      grossMargin: '₹130 (46.4%)',
      marketInfo: 'High demand observed in USA.',
      riskFactors: 'Shipping/customs clearance variance.',
      alternatives: 'Alternate suppliers available upon verification.'
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
    supplierName: 'EcoTextiles India (Demo Partner)',
    analysis: {
      totalCost: 100,
      sellingRange: '₹180–₹210',
      grossMargin: '₹80 (44.4%)',
      marketInfo: 'High demand observed in UAE retail markets.',
      riskFactors: 'Logistics and local compliance.',
      alternatives: 'Alternate suppliers available upon verification.'
    }
  }
];

window.verifiedSupplierDatabase = window.verifiedSupplierDatabase || [];

// --- Persistent Phase 3 Order Records Store ---
window.pncOrdersStore = window.pncOrdersStore || [
  {
    orderId: 'PNC-ORD-000001',
    buyerId: 'BUYER-DEMO-01',
    supplierId: 'SUP-01',
    supplierName: 'ABC Lighting Global (Demo Partner)',
    product: 'Smart LED Bulb',
    quantity: 500,
    sourceCountry: 'India',
    destinationCountry: 'USA',
    agreedPrice: 120,
    shippingCost: 30,
    totalAmount: 150,
    currency: 'Pi (Testnet Demo)',
    status: 'Order Confirmed',
    createdAt: '2026-03-20',
    updatedAt: '2026-03-20',
    paymentStatus: 'Payment Pending',
    paymentId: null,
    transactionId: null,
    fulfilmentStatus: 'Preparing / Ready for Dispatch'
  }
];

window.commerceRequirement = window.commerceRequirement || {
  product: null,
  category: null,
  quantity: null,
  unit: null,
  sourceCountry: null,
  destinationCountry: null,
  purpose: null,
  status: 'COLLECTING'
};

window.chatHistory = window.chatHistory || [];
window.activeAiProduct = window.activeAiProduct || null;
window.matchingSearchResults = window.matchingSearchResults || null;
window.activeOrderView = window.activeOrderView || null;

// --- Phase 1: Intent Extraction ---
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
  }
}

function getNextClarifyingQuestion() {
  const req = window.commerceRequirement;
  if (!req.product && !req.category) return "आप किस product या category की तलाश कर रहे हैं?";
  if (!req.quantity) return `आपको ${req.product || 'इस item'} की कितनी quantity चाहिए?`;
  if (!req.sourceCountry) return "आप इसे किस country से source करना चाहते हैं?";
  if (!req.destinationCountry) return "आप इसे किस country या market में sell या use करना चाहते हैं?";
  return null;
}

// --- Phase 2: Modular Matching Engine ---
function executeSupplierMatchingEngine(requirement) {
  const db = window.verifiedSupplierDatabase;
  if (!db || db.length === 0) {
    return { matches: [], status: 'NO_SOURCES_CONNECTED' };
  }
  return { matches: [], status: 'NO_MATCH' };
}

// --- Reactive Assistant UI Update ---
function updateAssistantUI() {
  const chatBox = document.getElementById('chat-messages');
  const summaryBox = document.getElementById('summary-render-box');
  if (!chatBox || !summaryBox) return;

  chatBox.innerHTML = window.chatHistory.length === 0 
    ? '<p class="text-gray-400 italic">"Type or speak your requirement (e.g. Mujhe India से 500 LED bulb USA भेजने हैं)..."</p>'
    : window.chatHistory.map(msg => `<div><strong>${msg.sender}:</strong> ${msg.text}</div>`).join('');
  
  chatBox.scrollTop = chatBox.scrollHeight;

  const req = window.commerceRequirement;
  if (req.status === 'CONFIRMED') {
    let matchOutput = '';
    if (window.matchingSearchResults) {
      matchOutput = `
        <div class="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-center text-xs text-gray-600">
          <p class="font-semibold text-gray-800 mb-1">🔍 Phase 2 Supplier Matching Results</p>
          <p class="text-gray-500 italic">"No verified supplier match found from current sources."</p>
          <p class="text-[10px] text-gray-400 mt-1">Real supplier data connection required.</p>
        </div>
      `;
    }

    summaryBox.innerHTML = `
      <div class="bg-purple-50 border border-purple-200 rounded-xl p-3 my-2 text-xs">
        <p class="font-bold text-purple-900 mb-1">✅ Requirement Ready (Demo/Test Flow)</p>
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
        ${matchOutput}
      </div>
    `;
  } else if (req.product && req.quantity && req.destinationCountry) {
    summaryBox.innerHTML = `
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
  } else {
    summaryBox.innerHTML = '';
  }
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
  updateAssistantUI();
}

function confirmRequirement() {
  window.commerceRequirement.status = 'CONFIRMED';
  window.matchingSearchResults = null;
  window.chatHistory.push({ sender: 'AI', text: `Requirement Ready. Click "Find Supplier Matches" to search connected supplier databases.` });
  updateAssistantUI();
}

function editRequirement() {
  window.commerceRequirement.status = 'COLLECTING';
  window.matchingSearchResults = null;
  window.chatHistory.push({ sender: 'AI', text: `ठीक है, आप अपनी आवश्यकता में जो बदलाव करना चाहें बता सकते हैं।` });
  updateAssistantUI();
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
    status: 'COLLECTING'
  };
  window.chatHistory = [];
  window.matchingSearchResults = null;
  updateAssistantUI();
}

function triggerPhase2Matching() {
  window.chatHistory.push({ sender: 'AI', text: 'Searching available supplier sources...' });
  updateAssistantUI();

  setTimeout(() => {
    window.matchingSearchResults = executeSupplierMatchingEngine(window.commerceRequirement);
    window.chatHistory.push({ sender: 'AI', text: 'No verified supplier match found from current sources. (Demo flow available via Today\'s Opportunities).' });
    updateAssistantUI();
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
    if (inputEl) inputEl.value = speechText;
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

// --- Phase 3: Real-World Commerce Flow & Enquiry Modal / Actions ---
function prepareOrder(productId) {
  const product = sampleProducts.find(p => p.id === productId);
  if (!product) return;

  const confirmEnquiry = confirm(`[Demo/Test Flow] Send Enquiry for ${product.name} (${product.supplierName})?\n\nQuantity: 500 units\nSource: ${product.sourceMarket}\nDestination: ${product.destinationMarket}`);
  
  if (confirmEnquiry) {
    // Create new demo order record in store
    const newOrderId = 'PNC-ORD-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      orderId: newOrderId,
      buyerId: 'BUYER-DEMO-01',
      supplierId: product.supplierId,
      supplierName: product.supplierName,
      product: product.name,
      quantity: 500,
      sourceCountry: product.sourceMarket,
      destinationCountry: product.destinationMarket,
      agreedPrice: product.sourcePrice,
      shippingCost: 30,
      totalAmount: product.sourcePrice * 500 + 30,
      currency: 'Pi (Testnet Demo)',
      status: 'Order Requested',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      paymentStatus: 'Payment Not Started',
      paymentId: null,
      transactionId: null,
      fulfilmentStatus: 'Preparing'
    };

    window.pncOrdersStore.unshift(newOrder);
    alert(`Enquiry & Order Request successfully created!\n\nOrder ID: ${newOrderId}\nStatus: Order Requested\n\nRedirecting you to My Orders to proceed with Pi Testnet Payment.`);
    
    switchTab('orders');
    renderOrdersScreen();
  }
}

// --- Render My Orders Screen (Phase 3) ---
function renderOrdersScreen() {
  const ordersContainer = document.getElementById('orders-content-container');
  if (!ordersContainer) return;

  if (!window.pncOrdersStore || window.pncOrdersStore.length === 0) {
    ordersContainer.innerHTML = `
      <div class="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
        <span class="text-2xl mb-2 block">📦</span>
        <h3 class="font-bold text-sm text-gray-900 mb-1">No Active Orders</h3>
        <p class="text-xs text-gray-600">Select an opportunity from Home and initiate an enquiry to start real-world commerce flow.</p>
      </div>
    `;
    return;
  }

  ordersContainer.innerHTML = window.pncOrdersStore.map(o => `
    <div class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3 mb-4">
      <div class="flex justify-between items-center border-b border-gray-100 pb-2">
        <span class="font-bold text-purple-700 text-xs">${o.orderId}</span>
        <span class="text-[10px] bg-purple-50 text-purple-800 px-2 py-0.5 rounded-full font-medium">Testnet Environment</span>
      </div>

      <div class="text-xs space-y-1 text-gray-700">
        <div><strong>Product:</strong> ${o.product} (${o.quantity} units)</div>
        <div><strong>Supplier:</strong> ${o.supplierName}</div>
        <div><strong>Destination:</strong> ${o.destinationCountry}</div>
        <div><strong>Order Status:</strong> <span class="font-semibold text-amber-700">${o.status}</span></div>
        <div><strong>Payment Status:</strong> <span class="font-semibold text-purple-800">${o.paymentStatus}</span></div>
        <div><strong>Fulfilment:</strong> ${o.fulfilmentStatus}</div>
      </div>

      <div class="flex gap-2 pt-1">
        <button onclick="openOrderDetails('${o.orderId}')" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-xl text-xs font-medium transition">
          View Timeline
        </button>
        <button onclick="initiatePiPayment('${o.orderId}')" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl text-xs font-medium transition shadow-sm">
          🔒 Pay with Pi
        </button>
      </div>
    </div>
  `).join('');
}

// --- Order Details / Timeline Modal ---
function openOrderDetails(orderId) {
  const order = window.pncOrdersStore.find(o => o.orderId === orderId);
  if (!order) return;

  alert(`Order Timeline (${order.orderId}):\n\n1. Requirement Confirmed ✓\n2. Supplier Matched (${order.supplierName}) ✓\n3. Enquiry Sent ✓\n4. Supplier Response Received ✓\n5. Order Requested & Confirmed ✓\n6. Payment Status: ${order.paymentStatus}\n7. Fulfilment: ${order.fulfilmentStatus}`);
}

// --- Pi Payment Flow (Phase 3) ---
function initiatePiPayment(orderId) {
  const order = window.pncOrdersStore.find(o => o.orderId === orderId);
  if (!order) return;

  const confirmPay = confirm(`[Pi Testnet Environment]\n\nInitiating secure payment for Order ${order.orderId}\nTotal Amount: ${order.totalAmount} ${order.currency}\n\nDo you want to proceed with official Pi Wallet authorization?`);
  
  if (confirmPay) {
    order.paymentStatus = 'Payment Submitted (Pending Verification)';
    order.status = 'Fulfilment In Progress';
    renderOrdersScreen();
    
    setTimeout(() => {
      order.paymentStatus = 'Payment Confirmed';
      order.status = 'Fulfilment In Progress';
      order.fulfilmentStatus = 'In Transit / Dispatched';
      alert(`Pi Testnet Payment Verified Successfully!\n\nTransaction ID: TXN-PI-${Math.floor(10000000 + Math.random() * 90000000)}\nOrder status updated to Fulfilment In Progress.`);
      renderOrdersScreen();
    }, 1500);
  }
}

// --- AI Advisor Permission Flow ---
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
        <p class="text-xs text-gray-700 mb-3">Would you like me to provide a detailed analysis of this product?</p>
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
        <p class="text-[9px] text-gray-400 italic mb-3">"AI estimates are for reference only. Final commercial decisions rest solely with the user."</p>
        <button onclick="closeProductAi(${product.id})" class="w-full bg-gray-100 text-gray-700 py-2 px-3
