const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 1. REGISTER A NEW USER
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user instance
    // Note: walletBalance defaults to 500 in our Model
    user = new User({
      username,
      email,
      password, // In a real app, hash this with bcrypt!
      walletBalance: 500 
    });

    await user.save();

    // Create a JWT Token so they are logged in immediately after registering
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        balance: user.walletBalance
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during registration');
  }
};

// 2. LOGIN EXISTING USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Check password (simple match for now)
    if (user.password !== password) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1d' });

    // Send back token and user data (to show in Navbar)
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        balance: user.walletBalance
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during login');
  }
};

// 3. GET CURRENT USER (To refresh balance in the UI)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: "User not found in Database" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};