const express = require('express');
const router = express.Router();
const Market = require('../models/Market');
const { createMarket, getMarkets } = require('../controllers/marketController.js');

router.post('/', createMarket);
router.get('/', getMarkets);

// Admin Quick Add Route updated to use dynamic array pricing rules
router.post('/add', async (req, res) => {
    try {
        const { question, category, optionTitles } = req.body;

        if (!question || !category) {
            return res.status(400).json({ msg: "Please fill all fields" });
        }

        // Fallback options layout if admin doesn't provide them explicitly
        const titles = optionTitles && Array.isArray(optionTitles) ? optionTitles : ["Yes", "No"];
        const cleanOptions = titles.filter(t => t.trim() !== '');
        const numOptions = cleanOptions.length;

        const initialShareValue = parseFloat((1 / numOptions).toFixed(4));
        const formattedOptions = cleanOptions.map(title => ({
            title: title.trim(),
            currentValue: initialShareValue,
            totalShares: 0
        }));

        const newMarket = new Market({
            question,
            category,
            description: "New market prediction.",
            options: formattedOptions,
            status: "active",
            totalLiquidity: 0
        });

        const savedMarket = await newMarket.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('newMarket', savedMarket);
        }

        res.json(savedMarket);
    } catch (err) {
        console.error("ADMIN ERROR:", err.message); 
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;