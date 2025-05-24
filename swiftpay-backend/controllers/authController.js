const { response } = require('express');
const User = require('../models/User');
const Wallet = require("../models/Wallet"); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register user
const registerUser = async (req, res) => {
  
  try {

const { fullName, email, password } = req.body;

   if (!fullName || !email || !password) {
    return response.status(400).json({ error: 'All Fields are required' });
  }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ fullName, email, password: hashed });
    await newUser.save();

    const newWallet = new Wallet({
      userId: newUser._id,
      balance: 0
    });
    await newWallet.save();
    
    res.status(201).json({ message: 'User registered successfully', userId: newUser._id, newWallet: newWallet._id });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required'
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2d' });
 
    const wallet = await Wallet.findOne({ userId: user._id });
    const balance = wallet ? wallet.balance : 0;

    res.json({ token, user: { fullName: user.fullName, walletBalance: user.walletBalance } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

module.exports = { registerUser, loginUser};