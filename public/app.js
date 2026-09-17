// ==========================================
// PiNexusCommerce - Complete app.js (Cleaned)
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

// --- Margin Calculator Logic ---
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

// --- Role Selection & Navigation Helpers ---
function selectRole(role) {
  localStorage.setItem('piNexusRole', role);
}

function loadSavedRole() {
  const saved = localStorage.getItem('piNexusRole');
  if (saved) {
    const el = document.getElementById('roleSelect');
    if (el) el.value = saved;
  }
}

function switchTab(tabName) {
  // Tab switching logic placeholder
  console.log('Switched to tab:', tabName);
}

// ==========================================
// AI Business Advisor State Machine (Clean)
// ==========================================

window.aiAdvisorState = window.aiAdvisorState || 'permission'; // 'permission' or 'analysis'

function renderAiAdvisor() {
  const mainArea = document.querySelector('main') || document.body;
  
  // Clear any existing legacy containers to prevent duplication
  const existingContainers = document.querySelectorAll('#ai-advisor-container, .ai-advisor-wrapper');
  existingContainers.forEach(el => el.remove());

  // Create unified container
  const container = document.createElement('div');
  container.id = 'ai-advisor-container';
  container.className = 'p-4 max-w-md mx-auto bg-white min-h-screen pb-20';

  if (window.aiAdvisorState === 'permission') {
    container.innerHTML = `
      <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 shadow-sm mb-4">
        <h2 class="text-xl font-bold text-gray-800 mb-2">AI Business Advisor</h2>
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
  }

  mainArea.appendChild(container);

  // Bind Event Handlers
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
      if (typeof openOrderFlow === 'function') {
        openOrderFlow();
      } else {
        alert('Opening Pi payment & order flow...');
      }
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

// Initial Load Handler
document.addEventListener('DOMContentLoaded', () => {
  loadSavedRole();
  renderAiAdvisor();
});
