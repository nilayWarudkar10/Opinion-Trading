const express = require('express');
const router = express.Router();
const { register, login, getUser } = require('../controllers/authController');
const { getUserPortfolio } = require('../controllers/userController');

// URL: GET http://localhost:5000/api/auth/portfolio/:userId
router.get('/portfolio/:userId', getUserPortfolio);

router.post('/register', register);//register
router.post('/login', login);//login
router.get('/user/:id', getUser);

module.exports = router;