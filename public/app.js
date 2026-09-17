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
        sellingPrice: 280
    },
    { 
        id: 2, 
        name: 'Cotton Tote Bag', 
        category: 'Clothing', 
        sourceMarket: 'India', 
        sourcePrice: 80, 
        currency: '₹', 
        destinationMarket: 'UAE', 
        description: 'Eco-friendly organic cotton carry bag.', 
        verified: false, 
        sample: true, 
        supplierId: 'SUP-02',
        additionalCost: 20,
        sellingPrice: 180
    }
];

document.addEventListener('DOMContentLoaded', () => {
    loadOpportunities(sampleProducts);
    loadSavedRole();
});

function switchTab(tabName, element) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`${tabName}-view`).classList.add('active');
    element.classList.add('active');
}

function loadOpportunities(products) {
    const container = document.getElementById('feed-container');
    const discoveryContainer = document.getElementById('discovery-container');
    
    const html = products.map(p => `
        <div class="card">
            <span class="tag">Sample Opportunity</span>
            <div class="product-title">${p.name}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">${p.description}</div>
            <div class="price-row"><span>Source Market: <b>${p.sourceMarket}</b></span><span>Source Price: <b style="color:var(--pi-purple);">${p.currency}${p.sourcePrice}</b></span></div>
            <div class="price-row"><span>Destination Target: <b>${p.destinationMarket}</b></span><span>Category: <b>${p.category}</b></span></div>
            
            <button style="margin-top: 10px;" onclick="triggerAIConsent(${p.id})">Ask AI Advisor</button>
            <button class="secondary" onclick="prepareOrder(${p.id})">🔒 Proceed to Order / Pi Payment</button>
        </div>
    `).join('');

    if(container) container.innerHTML = html;
    if(discoveryContainer) discoveryContainer.innerHTML = html;
}

function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = sampleProducts.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.sourceMarket.toLowerCase().includes(query) || 
        p.destinationMarket.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
    );
    
    const container = document.getElementById('feed-container');
    if(filtered.length === 0) {
        container.innerHTML = `<div class="card"><p style="text-align:center; color:var(--text-muted);">No matching opportunity found.</p></div>`;
    } else {
        loadOpportunities(filtered);
    }
}

function triggerAIConsent(productId) {
    const product = sampleProducts.find(p => p.id === productId);
    switchTab('advisor', document.querySelectorAll('.nav-item')[2]);
    
    document.getElementById('aiResponseContainer').innerHTML = `
        <div class="ai-box">
            <p style="font-weight:600; margin-bottom:8px;">Would you like me to provide a detailed analysis of this product (${product.name})?</p>
            <button onclick="showAIAnalysis(${product.id})">Yes, Show Analysis</button>
            <button class="secondary" onclick="closeAIAnalysis()">No, Not Now</button>
        </div>
    `;
}

function showAIAnalysis(productId) {
    const p = sampleProducts.find(item => item.id === productId);
    const totalCost = p.sourcePrice + p.additionalCost;
    const grossMargin = p.sellingPrice - totalCost;
    const marginPercent = ((grossMargin / p.sellingPrice) * 100).toFixed(1);

    document.getElementById('aiResponseContainer').innerHTML = `
        <div class="ai-box">
            <h4 style="color:var(--pi-purple); margin-bottom:6px;">✨ AI Estimate Analysis</h4>
            <p style="font-size:0.85rem; margin:3px 0;"><b>Source Price:</b> ${p.currency}${p.sourcePrice}</p>
            <p style="font-size:0.85rem; margin:3px 0;"><b>Estimated Additional Cost:</b> ${p.currency}${p.additionalCost}</p>
            <p style="font-size:0.85rem; margin:3px 0;"><b>Estimated Total Cost:</b> ${p.currency}${totalCost}</p>
            <p style="font-size:0.85rem; margin:3px 0;"><b>Potential Selling Price Range:</b> ${p.currency}${p.sellingPrice} – ${p.currency}${Math.round(p.sellingPrice * 1.15)}</p>
            <p style="font-size:0.85rem; margin:3px 0;"><b>Potential Gross Margin:</b> ${p.currency}${grossMargin} (${marginPercent}%)</p>
            <p style="font-size:0.85rem; margin:3px 0;"><b>Market Information:</b> High demand observed in ${p.destinationMarket}.</p>
            <p style="font-size:0.85rem; margin:3px 0;"><b>Risk Factors:</b> Shipping customs clearance & currency fluctuation variance.</p>
            <p style="font-size:0.85rem; margin:3px 0;"><b>Alternative Options:</b> Alternate regional suppliers available on verification.</p>
            <div class="disclaimer">This information is based on available data and estimates. Actual prices, costs and market conditions may change. The final decision is yours.</div>
        </div>
    `;
}

function closeAIAnalysis() {
    document.getElementById('aiResponseContainer').innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted); margin-top:10px;">Analysis closed. You may return to Home or Discover.</p>`;
}

function prepareOrder(productId) {
    alert("Pi Payment — Coming in the next integration phase. No transactions completed yet.");
}

function calculateMargin() {
    const src = parseFloat(document.getElementById('calcSource').value) || 0;
    const add = parseFloat(document.getElementById('calcAdd').value) || 0;
    const sell = parseFloat(document.getElementById('calcSell').value) || 0;

    const totalCost = src + add;
    const grossMargin = sell - totalCost;
    const marginPct = sell > 0 ? ((grossMargin / sell) * 100).toFixed(1) : 0;

    document.getElementById('calcResult').innerHTML = `
        Total Cost: ₹${totalCost} | Gross Margin: ₹${grossMargin} (${marginPct}%)<br>
        <span style="font-size:0.75rem; color:#a21caf;">This is a calculation, not a guarantee of profit.</span>
    `;
}

function selectRole(role) {
    localStorage.setItem('piNexusRole', role);
    const descriptions = {
        Buyer: "Find products and compare opportunities.",
        Seller: "Find markets and understand selling opportunities.",
        Supplier: "Reach potential buyers and markets.",
        Reseller: "Find products and evaluate resale opportunities."
    };
    document.getElementById('roleDescriptionText').innerText = `Selected Role (${role}): ${descriptions[role]}`;
    document.getElementById('activeRoleDisplay').innerText = role;
}

function loadSavedRole() {
    const saved = localStorage.getItem('piNexusRole') || 'Buyer';
    document.getElementById('roleSelectDropdown').value = saved;
    selectRole(saved);
}
// --- AI Business Advisor UX Improvement Addition ---
window.showPermissionPrompt = typeof window.showPermissionPrompt !== 'undefined' ? window.showPermissionPrompt : true;
window.showAnalysis = typeof window.showAnalysis !== 'undefined' ? window.showAnalysis : false;

function renderAiAdvisor() {
  let container = document.getElementById('ai-advisor-container');
  if (!container) {
    // Agar container nahi hai toh dynamic div create karke body ya main app mein add kar dete hain
    const mainArea = document.querySelector('main') || document.body;
    container = document.createElement('div');
    container.id = 'ai-advisor-container';
    container.className = 'p-4 max-w-md mx-auto';
    mainArea.appendChild(container);
  }

  if (window.showPermissionPrompt && !window.showAnalysis) {
    container.innerHTML = `
      <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 shadow-sm mb-4">
        <h2 class="text-xl font-bold text-gray-800 mb-2">AI Business Advisor</h2>
        <p class="text-sm text-gray-700 mb-3">
          Would you like the AI Advisor to generate a detailed commercial and estimate analysis for your business products?
        </p>
        <button id="yes-analysis-btn" class="bg-purple-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-purple-700 transition">
          Yes, Show Analysis
        </button>
      </div>
    `;
    
    const btn = document.getElementById('yes-analysis-btn');
    if (btn) {
      btn.onclick = () => {
        window.showPermissionPrompt = false;
        window.showAnalysis = true;
        renderAiAdvisor();
      };
    }
  } else if (window.showAnalysis) {
    container.innerHTML = `
      <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-md mt-4 transition-all">
        <h2 class="text-xl font-bold text-gray-800 mb-2">AI Business Advisor</h2>
        <h3 class="font-semibold text-gray-800 mb-2">Detailed Estimate Analysis</h3>
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

    const proceedBtn = document.getElementById('proceed-payment-btn');
    if (proceedBtn) {
      proceedBtn.onclick = () => {
        if (typeof openOrderFlow === 'function') {
          openOrderFlow();
        } else {
          // Fallback if order flow function is named differently
          alert('Opening Pi payment & order flow...');
        }
      };
    }

    const noBtn = document.getElementById('no-now-btn');
    if (noBtn) {
      noBtn.onclick = () => {
        window.showAnalysis = false;
        window.showPermissionPrompt = true;
        renderAiAdvisor();
      };
    }
  }
}

// Auto-run on load if container exists or init
document.addEventListener('DOMContentLoaded', () => {
  renderAiAdvisor();
});

