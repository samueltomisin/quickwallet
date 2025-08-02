const express = require("express");
const router = express.Router();
const Wallet = require("../models/Wallet");
const crypto = require("crypto");

// Verify that webhook came from Paystack
const verifyPaystackSignature = (req, secret) => {
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");
  return hash === req.headers["x-paystack-signature"];
};

router.post("/paystack/webhook", async (req, res) => {
  const isVerified = verifyPaystackSignature(req, process.env.PAYSTACK_SECRET_KEY);

  if (!isVerified) {
    return res.status(400).json({ message: "Unauthorized webhook" });
  }

  const event = req.body;

  if (event.event === "charge.success") {
    const email = event.data.customer.email;
    const amount = event.data.amount / 100;

    try {
      const wallet = await Wallet.findOne({ email });

      if (wallet) {
        wallet.balance += amount;
        await wallet.save();
      }
    } catch (error) {
      console.log("Wallet funding error:", error.message);
    }
  }

  res.sendStatus(200);
});

module.exports = router;
