const express = require('express');
const router = express.Router();
const Market = require('../models/Market');
const { createMarket, getMarkets } = require('../controllers/marketController.js');

router.post('/', createMarket);
router.get('/', getMarkets);

// Admin Quick Add Route updated to use dynamic array pricing rules
// Admin Route: POST http://localhost:5000/api/markets/add
router.post('/add', async (req, res) => {
    try {
        const { question, category, optionTitles } = req.body;

        if (!question || !category || !optionTitles || !Array.isArray(optionTitles)) {
            return res.status(400).json({ msg: "Please fill all fields and provide valid choices." });
        }

        const cleanOptions = optionTitles.filter(title => title.trim() !== '');
        const numOptions = cleanOptions.length;

        if (numOptions < 2 || numOptions > 5) {
            return res.status(400).json({ msg: "Markets must have between 2 and 5 choices." });
        }

        // 1 / number of options = Initial Price Distribution
        const initialShareValue = Math.round(100 / numOptions);

        const formattedOptions = cleanOptions.map(title => ({
            title: title.trim(),
            currentValue: initialShareValue,
            totalShares: 0
        }));

        const newMarket = new Market({
            question: question.trim(),
            category,
            options: formattedOptions,
            description: "New prediction pool open for speculation.",
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