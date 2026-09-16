const sampleProducts = [
    { id: 1, name: 'Smart LED Bulb', category: 'Electronics', sourceMarket: 'India', sourcePrice: 120, currency: '₹', destinationMarket: 'USA', estimatedSellingPrice: '₹250–₹320', description: 'Energy-efficient smart lighting solution.', verified: false, sample: true, supplierId: 'SUP-01' },
    { id: 2, name: 'Cotton Tote Bag', category: 'Clothing', sourceMarket: 'India', sourcePrice: 80, currency: '₹', destinationMarket: 'UAE', estimatedSellingPrice: '₹160–₹220', description: 'Eco-friendly organic cotton carry bag.', verified: false, sample: true, supplierId: 'SUP-02' }
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
            <div class="price-row"><span>Source: <b>${p.sourceMarket}</b></span><span>Source Price: <b style="color:var(--pi-purple);">${p.currency}${p.sourcePrice}</b></span></div>
            <div class="price-row"><span>Destination: <b>${p.destinationMarket}</b></span><span>Est. Selling: <b>${p.estimatedSellingPrice}</b></span></div>
            <button style="margin-top: 10px;" onclick="triggerAIConsent('${p.name}', ${p.sourcePrice})">Ask AI Advisor</button>
            <button class="secondary" onclick="alert('Pi Network Integration — Coming in the next phase. Payment in Pi.')">🔒 Proceed with Payment in Pi</button>
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

function triggerAIConsent(productName, sourcePrice) {
    switchTab('advisor', document.querySelectorAll('.nav-item')[2]);
    document.getElementById('aiResponseContainer').innerHTML = `
        <div class="ai-box">
            <p style="font-weight:600; margin-bottom:8px;">Would you like me to provide a detailed analysis of this product (${productName})?</p>
            <button onclick="showAIAnalysis(${sourcePrice})">Yes, Show Analysis</button>
            <button class="secondary" onclick="closeAIAnalysis()">No, Not Now</button>
        </div>
    `;
}

function showAIAnalysis(sourcePrice) {
    const additionalCost = 30;
    const sellingPrice = sourcePrice * 2.2;
    const totalCost = sourcePrice + additionalCost;
    const grossMargin = sellingPrice - totalCost;
    const marginPercent = ((grossMargin / sellingPrice) * 100).toFixed(1);

    document.getElementById('aiResponseContainer').innerHTML = `
        <div class="ai-box">
            <h4 style="color:var(--pi-purple); margin-bottom:6px;">✨ AI Estimate Analysis</h4>
            <p style="font-size:0.85rem; margin:3px 0;"><b>Source Price:</b> ₹${sourcePrice}</p>
            <p style="font-size:0.85rem; margin:3px 0;"><b>Estimated Additional Cost:</b> ₹${additionalCost}</p>
            <p style="font-size:0.85rem; margin:3px 0;"><b>Estimated Total Cost:</b> ₹${totalCost}</p>
            <p style="font-size:0.85rem; margin:3px 0;"><b>Potential Selling Range:</b> ₹${Math.round(sellingPrice)} – ₹${Math.round(sellingPrice * 1.2)}</p>
            <p style="font-size:0.85rem; margin:3px 0;"><b>Potential Gross Margin:</b> ₹${Math.round(grossMargin)} (${marginPercent}%)</p>
            <p style="font-size:0.85rem; margin:3px 0;"><b>Market Information:</b> High demand observed in destination target region.</p>
            <p style="font-size:0.85rem; margin:3px 0;"><b>Risk Factors:</b> Shipping delays & currency variance.</p>
            <div class="disclaimer">This information is based on available data and estimates. Actual prices, costs and market conditions may change. The final decision is yours.</div>
        </div>
    `;
}

function closeAIAnalysis() {
    document.getElementById('aiResponseContainer').innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted); margin-top:10px;">Analysis closed.</p>`;
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

