const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, unique: true },
  email: { type: String, required: true },
  balance: { type: Number, default: 0 },
  currency: {
    type: String,
    default: "NGN",
  },

});

module.exports = mongoose.model("Wallet", WalletSchema);
