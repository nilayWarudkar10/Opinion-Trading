const express = require('express');
const router = express.Router();
const Market = require('../models/Market'); // <--- CRITICAL: You were missing this!
const { createMarket, getMarkets } = require('../controllers/marketController.js');

// 1. Existing Routes
router.post('/', createMarket);
router.get('/', getMarkets);

// 2. Admin Route: POST http://localhost:5000/api/markets/add
router.post('/add', async (req, res) => {
    try {
        const { question, category } = req.body;

        // Validation
        if (!question || !category) {
            return res.status(400).json({ msg: "Please fill all fields" });
        }

        const newMarket = new Market({
            question,
            category,
            yesPrice: 50,      // Ensure this is 50
            noPrice: 50,       // Ensure this is 50
            status: "active",  // CRITICAL: Must match your old data
            description: "New market prediction.", // Default description
            totalLiquidity: 0  // Set to 0
        });

        const savedMarket = await newMarket.save();

        // 3. Broadcast to all users via Socket.io
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