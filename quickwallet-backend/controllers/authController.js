const User = require('../models/User');
const Wallet = require("../models/Wallet"); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateToken = require("../utils/generateToken");

// Register user
const registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;
  
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ fullName, email, password: hashedPassword });

    // Create wallet for new user
    const wallet = new Wallet({
      user: newUser._id,
      email: email,
      balance: 0,
      currency: "NGN",
    });
    await wallet.save();
    console.log("💼 Wallet created for user:", newUser._id);

    res.status(201).json({ 
      message: 'User registered successfully', 
      user: {
        _id: newUser._id, 
        fullName: newUser.fullName, 
        email: newUser.email
      },
      token: generateToken(newUser._id) 
    });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ 
      message: 'Login successful',
      user: { 
        fullName: user.fullName, 
        email: user.email, 
        _id: user._id 
      },
      token: generateToken(user._id) 
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: 'Login failed' });
  }
};

module.exports = { registerUser, loginUser };