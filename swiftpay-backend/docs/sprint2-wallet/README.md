# 🏁 Sprint 2 – Wallet Module (SwiftPay Backend)

## 📌 Objective
Implement wallet functionality for users of the SwiftPay app, enabling them to:
- Automatically create a wallet upon registration
- Fund their wallet
- Withdraw from their wallet
- Check wallet balance

---

## 🔧 Features Implemented
| Feature              | Endpoint                         | Method |
|----------------------|----------------------------------|--------|
| Create wallet        | `/api/wallet/create`             | POST   |
| Get wallet balance   | `/api/wallet/:userId`            | GET    |
| Fund wallet          | `/api/wallet/fund`               | POST   |
| Withdraw from wallet | `/api/wallet/withdraw`           | POST   |

---

## 📁 Folder Structure Summary
```

swiftpay-backend/
├── controllers/
│   └── walletController.js
├── routes/
│   └── walletRoutes.js
├── models/
│   └── Wallet.js
├── middleware/
│   └── authMiddleware.js

````

---

## 🧪 Postman Testing

### 1. Create Wallet
**POST** `/api/wallet/create`

```json
{
  "userId": "6614e45b13e1a3ab282ef8c2"
}
````

✅ Response:

```json
{
  "message": "Wallet created successfully",
  "wallet": {
    "balance": 0,
    "userId": "...",
    "_id": "...",
    ...
  }
}
```

---

### 2. Fund Wallet

**POST** `/api/wallet/fund`

```json
{
  "userId": "6614e45b13e1a3ab282ef8c2",
  "amount": 1000
}
```

✅ Response:

```json
{
  "message": "Wallet funded successfully",
  "balance": 1000
}
```

---

### 3. Withdraw Wallet

**POST** `/api/wallet/withdraw`

```json
{
  "userId": "6614e45b13e1a3ab282ef8c2",
  "amount": 500
}
```

✅ Response:

```json
{
  "message": "Withdrawal successful",
  "balance": 500
}
```

---

### 4. Get Wallet Balance

**GET** `/api/wallet/:userId`

✅ Response:

```json
{
  "wallet": {
    "userId": "...",
    "balance": 500
  }
}
```

---

## ❌ Errors & Fixes During Sprint

### 🔸 Error 1: `app is not defined`

**Cause:** Called `app.use(...)` in `authMiddleware.js` — outside the `server.js` file.
**Fix:** Removed routing logic from `authMiddleware.js`. Routes belong inside `server.js`.

---

### 🔸 Error 2: `Cannot access 'app' before initialization`

**Cause:** Trying to use `app.use()` in the wrong place or before it was declared.
**Fix:** Ensure all `app.use(...)` calls are after `const app = express()` in `server.js`.

---

### 🔸 Error 3: `Wallet not found`

**Cause:** Wrong or missing `userId` in wallet fetch route.
**Fix:** Double-checked `userId` from registration; ensured it's passed correctly in requests.

---

### 🔸 Error 4: `newUser is not defined`

**Cause:** Used variable `newUser` without declaring it in auth controller.
**Fix:** Removed or replaced with the correct variable name (`user` or `savedUser`).

---

### 🔸 Error 5: `argument handler must be a function`

**Cause:** Route handler was undefined or incorrectly exported.
**Fix:** Ensured route handler (`registerUser`, `fundWallet`, etc.) is imported/exported properly.

---

### 🔍 Simple Explanation (for kids 😄)

When we say:

```js
router.post("/fund", fundWallet)
```

We expect `fundWallet` to be a function that knows how to handle the request. If we forget to write it or import it, the app gets confused and says:

> "Hey! I can't run a function that doesn’t exist!"
> So we fixed it by making sure the code was there and working.

---

## 📌 Sprint 2 Status: ✅ COMPLETED

* [x] Core Wallet APIs
* [x] Postman Testing
* [x] MongoDB Integration
* [x] Error Resolution
* [x] GitHub Commit

---

## 🪪 Developer Notes

* Wallet creation should ideally be automated post-registration.
* Protect wallet routes with auth middleware.
* Future improvement: transaction logging and wallet-to-wallet transfers.

---

## 🗓️ Sprint Duration

**Start Date:** May 8, 2025
**End Date:** May 9, 2025
**Total Duration:** 2 Days


