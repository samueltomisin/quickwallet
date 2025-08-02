const prisma = require('../prismaClient')
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

    const userExists = await prisma.user.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          fullName,
          email,
          password: hashedPassword
        }
      });

    // Create wallet for new user
    await prisma.wallet.create({
      date:{ser: newUser._id,
      email: email,
      balance: 0,
      currency: "NGN"
    }
  });
return user;
    });

    console.log("Wallet Created for user:", newUser.id)
    

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

    const user = await prisma.user.findUnique({ 
    where: { email}
    });
    
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