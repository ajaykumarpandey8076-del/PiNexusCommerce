// ==========================================
// PiNexusCommerce - Final Product Rendering Fix
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

window.activeAiProduct = window.activeAiProduct || null;

// --- Load Opportunities with Auto-Container Fallback ---
function loadOpportunities(productsToDisplay = sampleProducts) {
  let container = document.getElementById('opportunities-container');
  if (!container) {
    // Fallback: create container dynamically if missing in index.html
    container = document.createElement('div');
    container.id = 'opportunities-container';
    container.className = 'p-4 max-w-md mx-auto';
    const mainArea = document.querySelector('main') || document.body;
    mainArea.appendChild(container);
  }

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
          <span class="font-medium">${p.sourceMarket} (₹${p.sourcePrice})</span>
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

// --- Product-Specific AI Advisor Flow ---
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
          Would you like me to provide a detailed analysis of this product (${product.name})?
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
          <div><strong>Source Price:</strong> ₹${product.sourcePrice}</div>
          <div><strong>Estimated Additional Cost:</strong> ₹${product.additionalCost}</div>
          <div><strong>Estimated Total Cost:</strong> ₹${a.totalCost}</div>
          <div><strong>Potential Selling Price Range:</strong> ${a.sellingRange}</div>
          <div><strong>Potential Gross Margin:</strong> ${a.grossMargin}</div>
          <div><strong>Market Information:</strong> ${a.marketInfo}</div>
          <div><strong>Risk Factors:</strong> ${a.riskFactors}</div>
          <div><strong>Alternative Options:</strong> ${a.alternatives}</div>
        </div>

        <p class="text-[9px] text-gray-400 italic mb-3">
          "This information is based on available data and estimates. Actual prices, costs and market conditions may change. The final decision is yours."
        </p>

        <div class="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <button onclick="prepareOrder(${product.id})" class="w-full bg-purple-600 text-white py-2.5 px-3 rounded-lg font-semibold text-xs hover:bg-purple-700 transition flex items-center justify-center gap-1.5 shadow-sm">
            🔒 Proceed to Order / Pi Payment
          </button>
          <button onclick="closeProductAi(${product.id})" class="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-lg font-medium text-xs hover:bg-gray-200 transition">
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
  const name = product ? product.name : 'Product';
  alert(`Initiating Pi Testnet payment flow for ${name}. Official Pi Testnet confirmation pending. Note: No real Pi transaction is complete without network confirmation.`);
}

// --- Initial Execution ---
document.addEventListener('DOMContentLoaded', () => {
  loadSavedRole();
  loadOpportunities(sampleProducts);
});

