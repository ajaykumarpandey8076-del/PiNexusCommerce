// ==========================================
// PiNexusCommerce - Complete Foolproof app.js
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
    description: 'Energy-efficient smart LED bulb with Wi-Fi control.',
    verified: false,
    sample: true,
    supplierId: 'SUP-01',
    additionalCost: 30,
    sellingPrice: 280
  },
  {
    id: 2,
    name: 'Cotton Tote Bag',
    category: 'Clothing',
    sourceMarket: 'India',
    sourcePrice: 80,
    currency: '₹',
    destinationMarket: 'Europe',
    description: 'Eco-friendly reusable cotton grocery tote bag.',
    verified: true,
    sample: false,
    supplierId: 'SUP-02',
    additionalCost: 20,
    sellingPrice: 150
  }
];

// --- Ensure All UI Sections Exist & Render Products ---
function ensureAndRenderAll() {
  const mainArea = document.querySelector('main') || document.body;

  // 1. Ensure Opportunities / Products Section
  let oppContainer = document.getElementById('opportunities-container');
  if (!oppContainer) {
    oppContainer = document.createElement('div');
    oppContainer.id = 'opportunities-container';
    oppContainer.className = 'p-4 max-w-md mx-auto';
    mainArea.appendChild(oppContainer);
  }
  loadOpportunities(sampleProducts);

  // 2. Ensure Margin Calculator Section
  let calcContainer = document.getElementById('margin-calculator-container');
  if (!calcContainer && !document.getElementById('sourcePrice')) {
    calcContainer = document.createElement('div');
    calcContainer.id = 'margin-calculator-container';
    calcContainer.className = 'p-4 max-w-md mx-auto bg-white border border-gray-200 rounded-xl my-4 shadow-sm';
    calcContainer.innerHTML = `
      <h3 class="font-bold text-gray-800 mb-2">Margin Calculator</h3>
      <p class="text-xs text-gray-600 mb-3">Calculate financial projections (Not a profit guarantee).</p>
      <div class="space-y-2">
        <input type="number" id="sourcePrice" placeholder="Source Price (₹)" class="w-full p-2 border rounded-lg text-xs" oninput="calculateMargin()" />
        <input type="number" id="additionalCost" placeholder="Additional Cost (₹)" class="w-full p-2 border rounded-lg text-xs" oninput="calculateMargin()" />
        <input type="number" id="sellingPrice" placeholder="Selling Price (₹)" class="w-full p-2 border rounded-lg text-xs" oninput="calculateMargin()" />
        <div id="calcResult" class="text-xs font-semibold text-purple-700 mt-2">Total Cost: ₹0 | Gross Margin: ₹0 (0%)</div>
      </div>
    `;
    mainArea.appendChild(calcContainer);
  }

  // 3. Ensure AI Business Advisor Section
  renderAiAdvisor();
}

function loadOpportunities(productsToDisplay = sampleProducts) {
  const container = document.getElementById('opportunities-container');
  if (!container) return;

  container.innerHTML = productsToDisplay.map(p => `
    <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-4">
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-bold text-gray-800">${p.name}</h3>
        <span class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">${p.category}</span>
      </div>
      <p class="text-xs text-gray-600 mb-2">${p.description}</p>
      <div class="text-xs text-gray-500 space-y-1 mb-3">
        <div><strong>Source Market:</strong> ${p.sourceMarket} (Price: ${p.currency}${p.sourcePrice})</div>
        <div><strong>Destination Target:</strong> ${p.destinationMarket}</div>
        <div><strong>Supplier ID:</strong> ${p.supplierId}</div>
        <div><strong>Selling Price:</strong> ${p.currency}${p.sellingPrice}</div>
      </div>
      <div class="flex gap-2">
        <button onclick="triggerAIConsent(${p.id})" class="flex-1 bg-purple-600 text-white py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-purple-700 transition">
          Ask AI Advisor
        </button>
        <button onclick="prepareOrder(${p.id})" class="flex-1 bg-gray-100 text-gray-700 py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-gray-200 transition">
          Proceed to Order / Pi Payment
        </button>
      </div>
    </div>
  `).join('');
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

// --- Role Selection & Navigation ---
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
    if (el) {
      el.classList.toggle('hidden', t !== tabName);
    }
  });
}

// --- Order / Pi Payment Flow ---
function prepareOrder(productId) {
  const product = sampleProducts.find(p => p.id === productId);
  if (product) {
    alert(`Initiating Pi Testnet payment flow for ${product.name}. Official Pi Testnet confirmation pending.`);
  } else {
    alert('Initiating Pi Testnet payment flow.');
  }
}

function openOrderFlow() {
  alert('Opening Pi payment & order flow...');
}

// ==========================================
// AI Business Advisor State Machine (Isolated)
// ==========================================

window.aiAdvisorState = window.aiAdvisorState || 'permission';

function renderAiAdvisor() {
  let container = document.getElementById('ai-advisor-container');
  if (!container) {
    const mainArea = document.querySelector('main') || document.body;
    container = document.createElement('div');
    container.id = 'ai-advisor-container';
    container.className = 'p-4 max-w-md mx-auto my-4';
    mainArea.appendChild(container);
  }

  if (window.aiAdvisorState === 'permission') {
    container.innerHTML = `
      <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 shadow-sm mb-4">
        <h3 class="font-bold text-gray-800 mb-2">AI Business Advisor</h3>
        <p class="text-sm text-gray-700 mb-3">
          Would you like the AI Advisor to generate a detailed commercial and estimate analysis for your business products?
        </p>
        <button id="yes-analysis-btn" class="bg-purple-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-purple-700 transition w-full">
          Yes, Show Analysis
        </button>
      </div>
    `;
  } else if (window.aiAdvisorState === 'analysis') {
    container.innerHTML = `
      <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-md mt-4 transition-all">
        <h3 class="font-bold text-gray-800 mb-2">AI Business Advisor</h3>
        <h4 class="font-semibold text-gray-800 mb-2">Detailed Estimate Analysis</h4>
        <p class="text-xs text-gray-600 mb-4">
          Based on current market estimates and your product margins, here is the breakdown of your commercial performance and pricing viability.
        </p>
        <p class="text-[10px] text-gray-400 italic mb-4">
          Disclaimer: Estimates are provided for guidance purposes only. The user retains final decision-making authority over all pricing and transactions.
        </p>
        <div class="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <button id="proceed-payment-btn" class="w-full bg-purple-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-purple-700 transition flex items-center justify-center gap-2">
            Proceed to Order / Pi Payment
          </button>
          <button id="no-now-btn" class="w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-200 transition">
            No, Not Now
          </button>
        </div>
      </div>
    `;
  }

  // Bind Event Handlers safely
  const yesBtn = document.getElementById('yes-analysis-btn');
  if (yesBtn) {
    yesBtn.onclick = () => {
      window.aiAdvisorState = 'analysis';
      renderAiAdvisor();
    };
  }

  const proceedBtn = document.getElementById('proceed-payment-btn');
  if (proceedBtn) {
    proceedBtn.onclick = () => {
      openOrderFlow();
    };
  }

  const noBtn = document.getElementById('no-now-btn');
  if (noBtn) {
    noBtn.onclick = () => {
      window.aiAdvisorState = 'permission';
      renderAiAdvisor();
    };
  }
}

function triggerAIConsent(productId) {
  window.aiAdvisorState = 'analysis';
  renderAiAdvisor();
  const container = document.getElementById('ai-advisor-container');
  if (container) {
    container.scrollIntoView({ behavior: 'smooth' });
  }
}

// Initial Load Handler
document.addEventListener('DOMContentLoaded', () => {
  loadSavedRole();
  ensureAndRenderAll();
});
