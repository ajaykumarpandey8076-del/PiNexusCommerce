app.post('/api/search-commerce', async (req, res) => {
    try {
        const { query } = req.body;
        
        // Agar query nahi aayi
        if (!query) {
            return res.status(400).json({ error: "Search query is required." });
        }

        // Aapka existing search/Gemini logic yahan rahega, 
        // aur result ko hamesha 'result' key ke andar bhejein:
        res.json({ result: "Results for: " + query }); // Apne actual Gemini/Grounding response se replace karein
        
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: error.message || "Live research is temporarily unavailable." });
    }
});

