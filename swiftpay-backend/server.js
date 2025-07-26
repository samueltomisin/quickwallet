const dotenv = require('dotenv');
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const walletRoutes = require("./routes/walletRoutes");
const transactionRoutes = require('./routes/transactionRoutes');
const paystackRoutes = require("./routes/paystackRoutes");
const webhookRoutes = require("./routes/webhook");




dotenv.config();
connectDB();
console.log("MongoDB URI:", process.env.MONGO_URI);


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use("/api/wallet", walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use("/api/paystack", paystackRoutes);
app.use("/", webhookRoutes);

app.get("/", (req, res) => {
    res.send("SwiftPay API is running...")
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
