const express = require('express');
const app = express();
app.use(express.json());

// AI Advisor Endpoint with Consent-First Logic & Mandatory Disclaimers
app.post('/api/ai/analyze', (req, res) => {
    const { userId, productId, userConsented, userRole } = req.body;

    // Guardrail 1: Check explicit user consent
    if (!userConsented) {
        return res.status(200).json({
            status: "paused",
            message: "Would you like me to provide a detailed analysis of this product?"
        });
    }

    // Role-based information masking & privacy
    let supplierInfo = userRole === 'supplier' ? "Confidential Source Data" : "Verified Global Supplier";

    // Sample Calculation (Non-guaranteed estimates)
    const sourcePrice = 100.00; 
    const estimatedShipping = 25.00;
    const estimatedTotalCost = sourcePrice + estimatedShipping;
    const potentialSellingMin = 160.00;
    const potentialSellingMax = 200.00;
    
    const estimatedMarginMin = ((potentialSellingMin - estimatedTotalCost) / potentialSellingMin) * 100;

    // Response with mandatory disclaimer
    return res.status(200).json({
        status: "success",
        data: {
            supplier: supplierInfo,
            sourcePrice,
            estimatedTotalCost,
            potentialSellingRange: `${potentialSellingMin} - ${potentialSellingMax}`,
            estimatedGrossMarginPercent: estimatedMarginMin.toFixed(2) + "% (Estimated)"
        },
        disclaimer: "This information is based on available data and estimates. Market conditions and actual costs may change. The final decision is yours."
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PiNexusCommerce MVP running on port ${PORT}`));

