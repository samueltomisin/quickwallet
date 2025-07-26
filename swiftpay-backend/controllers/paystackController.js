// controllers/paystackController.js

const axios = require("axios");
const { validationResult } = require('express-validator');

const initializePayment = async (req, res) => {
  const { email, amount } = req.body;

  try {
    // User is already authenticated via authMiddleware
    const { amount } = req.body;
    const user = req.user; // From authMiddleware

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ 
        success: false,
        message: "Valid amount is required" 
      });
    }
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Paystack uses kobo
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Payment initialized",
      data: response.data.data
    });
  } catch (error) {
    return res.status(500).json({ error: error.response.data });
  }
};

module.exports = { initializePayment };
