
# 🚀 Sprint 3: Wallet-to-Wallet Transfers

## 📌 Objective

Enable SwiftPay users to transfer funds securely from one wallet to another using a wallet-to-wallet payment API.

---

## ✅ Sprint Goals

* Implement a secure internal wallet-to-wallet transfer system.
* Prevent negative balances and invalid transfers.
* Ensure both parties’ balances are updated accurately.
* Log the transaction on both sides.
* Ensure atomicity to prevent partial transactions.

---

## 📁 Key Files Updated

* `controllers/walletController.js`
* `routes/walletRoutes.js`

---

## 🔁 API Endpoint: Transfer Funds

| Endpoint               | Method | Description                                        |
| ---------------------- | ------ | -------------------------------------------------- |
| `/api/wallet/transfer` | POST   | Transfer funds from one user's wallet to another's |

### 🔐 Middleware:

* `authMiddleware.js` (ensures only logged-in users can access the endpoint)

---

## 📄 Sample Request (Postman)

**POST** `/api/wallet/transfer`

```json
{
  "fromUserId": "665c9a2e4abc123d77e98abc",
  "toUserEmail": "receiver@email.com",
  "amount": 1500
}
```

---

## 🔁 Core Logic in `walletController.js`

### ✅ What it does:

* Validates inputs
* Confirms both users exist
* Checks sender has enough balance
* Subtracts from sender, adds to receiver
* Saves updated balances
* Logs transactions for both sender and receiver

```js
exports.transferFunds = async (req, res) => {
  const { fromUserId, toUserEmail, amount } = req.body;

  try {
    if (amount <= 0) {
      return res.status(400).json({ message: "Transfer amount must be greater than zero" });
    }

    const senderWallet = await Wallet.findOne({ userId: fromUserId });
    const receiverUser = await User.findOne({ email: toUserEmail });
    if (!receiverUser) return res.status(404).json({ message: "Receiver not found" });

    const receiverWallet = await Wallet.findOne({ userId: receiverUser._id });

    if (!senderWallet || !receiverWallet) {
      return res.status(404).json({ message: "Sender or receiver wallet not found" });
    }

    if (senderWallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    await senderWallet.save();
    await receiverWallet.save();

    await recordTransaction(fromUserId, 'transfer_out', amount, 'success');
    await recordTransaction(receiverUser._id, 'transfer_in', amount, 'success');

    res.status(200).json({ message: "Transfer successful" });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};
```

---

## 🐞 Common Errors Encountered & Fixes

| Error                         | Cause                                | Fix                                                |
| ----------------------------- | ------------------------------------ | -------------------------------------------------- |
| `"Receiver not found"`        | Email doesn't match an existing user | Ensure receiver is registered                      |
| `"Insufficient balance"`      | Transfer amount > wallet balance     | Add balance or reduce amount                       |
| `MongoError` on save          | Wallet not found or null             | Check for null and ensure user wallets exist       |
| Undefined `recordTransaction` | Function not imported                | Ensure `recordTransaction` is defined and imported |

---

## 📊 Test Results

| Scenario                            | Result                     |
| ----------------------------------- | -------------------------- |
| Transfer with valid user and amount | ✅ Success                  |
| Transfer to non-existent email      | ❌ 404 Receiver not found   |
| Transfer amount > balance           | ❌ 400 Insufficient balance |
| Negative or zero amount             | ❌ 400 Validation error     |

---

## 💡 Lessons Learned

* Always validate request inputs.
* Atomicity is crucial in money movement (update both sender and receiver or neither).
* Transaction history must log both sender and receiver actions.
* Testing edge cases prevents loss of funds or double charges.

---

