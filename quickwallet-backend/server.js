const dotenv = require('dotenv');
const express = require('express');
//const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const walletRoutes = require("./routes/walletRoutes");
const transactionRoutes = require('./routes/transactionRoutes');





dotenv.config();



const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use("/api/wallet", walletRoutes);
app.use('/api/transactions', transactionRoutes);


app.get("/", (req, res) => {
    res.send("QuickWallet API is running...")
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`QuickWallet API running on port ${PORT}`));
