const prisma = require('./prismaClient');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
// const connectDB = require('./startup/connectDB');


const authRoutes = require('./routes/authRoutes');
const walletRoutes = require("./routes/walletRoutes");
const transactionRoutes = require('./routes/transactionRoutes');





dotenv.config();



const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan ('dev'));

app.use('/api/auth', authRoutes);
app.use("/api/wallet", walletRoutes);
app.use('/api/transactions', transactionRoutes);


app.get("/", (req, res) => {
    res.send("QuickWallet API is running...")
});

const PORT = process.env.PORT || 5432;
app.listen(PORT, () => console.log(`QuickWallet API running on port ${PORT}`));
