const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let mockProducts = [
    { id: 1, title: 'Smart Solar Power Bank 20000mAh', category: 'Electronics', sourceCountry: 'India', sourcePrice: 18.50, priceType: 'verified', destination: 'USA', estimatedShipping: 4.50, estimatedOther: 1.00, minSell: 35.00, maxSell: 45.00 },
    { id: 2, title: 'Organic Cotton Artisan Tote Bags', category: 'Clothing', sourceCountry: 'Vietnam', sourcePrice: 3.20, priceType: 'verified', destination: 'Europe', estimatedShipping: 1.50, estimatedOther: 0.50, minSell: 9.99, maxSell: 14.99 },
    { id: 3, title: 'Handcrafted Bamboo Kitchen Organizer', category: 'Home', sourceCountry: 'Indonesia', sourcePrice: 6.00, priceType: 'estimated', destination: 'Canada', estimatedShipping: 3.00, estimatedOther: 0.80, minSell: 18.00, maxSell: 24.00 }
];

let mockOrders = [];
let platformRevenueLog = [];

app.get('/api/opportunities', (req, res) => {
    const { category } = req.query;
    let items = mockProducts;
    if (category && category !== 'All') {
        items = items.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    res.json({
        status: 'success',
        count: items.length,
        opportunities: items.map(item => {
            const totalCost = item.sourcePrice + item.estimatedShipping + item.estimatedOther;
            const estMinMargin = (((item.minSell - totalCost) / item.minSell) * 100).toFixed(1);
            return {
                ...item,
                estimatedTotalCost: totalCost.toFixed(2),
                estimatedGrossMarginPercent: estMinMargin + '%'
            };
        })
    });
});

app.post('/api/ai/analyze', (req, res) => {
    const { productId, userConsented, userRole } = req.body;
    const product = mockProducts.find(p => p.id === Number(productId)) || mockProducts[0];

    if (!userConsented) {
        return res.status(200).json({
            status: "paused",
            message: "Would you like me to provide a detailed analysis of this product?"
        });
    }

    const supplierInfo = userRole === 'supplier' ? "Confidential Source Data (Protected)" : "Verified Global Supplier Network";
    const totalCost = product.sourcePrice + product.estimatedShipping + product.estimatedOther;
    const marginMin = ((product.minSell - totalCost) / product.minSell) * 100;
    const marginMax = ((product.maxSell - totalCost) / product.maxSell) * 100;

    res.json({
        status: "success",
        data: {
            productName: product.title,
            source: `${product.sourceCountry} ($${product.sourcePrice})`,
            destinationMarket: product.destination,
            estimatedTotalCost: totalCost.toFixed(2),
            potentialSellingRange: `$${product.minSell.toFixed(2)} - $${product.maxSell.toFixed(2)}`,
            potentialGrossMargin: `${marginMin.toFixed(1)}% — ${marginMax.toFixed(1)}% (Estimated)`,
            marketSignals: "High demand in destination market, low seasonal supply.",
            riskFactors: "Shipping customs clearance variability; currency fluctuation.",
            alternativeSources: ["Alternative Tier-2 Supplier in region available upon verification"]
        },
        disclaimer: "This information is based on available data and estimates. Market conditions and actual costs may change. The final decision is yours."
    });
});

app.post('/api/orders/create', (req, res) => {
    const { productId, buyerId, agreedTotal, paymentMethod } = req.body;
    const product = mockProducts.find(p => p.id === Number(productId));
    
    if (!product) {
        return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    const platformFee = Number((agreedTotal * 0.02).toFixed(2));
    const newOrder = {
        orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        productId: product.id,
        productTitle: product.title,
        buyerId: buyerId || 'Guest-Pi-User',
        totalAmount: agreedTotal,
        platformFee: platformFee,
        paymentMethod: paymentMethod || 'Pi Wallet SDK (Pending Confirmation)',
        status: 'Pending Pi Payment Confirmation',
        createdAt: new Date().toISOString()
    };

    mockOrders.push(newOrder);
    platformRevenueLog.push({ orderId: newOrder.orderId, fee: platformFee, timestamp: newOrder.createdAt });

    res.json({
        status: 'success',
        message: 'Order created successfully. Complete payment via Pi Network Wallet.',
        order: newOrder
    });
});

app.get('/api/admin/metrics', (req, res) => {
    const totalVolume = mockOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalRevenue = platformRevenueLog.reduce((sum, r) => sum + r.fee, 0);
    res.json({
        dailyActiveUsers: 1420,
        monthlyActiveUsers: 28950,
        totalProducts: mockProducts.length,
        totalSuppliers: 48,
        totalOrders: mockOrders.length,
        transactionVolumeUSD: totalVolume.toFixed(2),
        platformRevenueUSD: totalRevenue.toFixed(2),
        aiAdvisorQueries: 312
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PiNexusCommerce Global MVP running on port ${PORT}`));
           
