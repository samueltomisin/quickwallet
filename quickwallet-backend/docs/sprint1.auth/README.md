# 📦 Sprint 1: User Authentication API Documentation

This document provides an overview of the backend authentication system built in Sprint 1 of the SwiftPay fintech app project. It captures the rationale behind technical decisions, key processes, and security practices for interview, documentation, and portfolio purposes.

---

## ✅ 1. Why Express.js?

**Express.js** was chosen for its simplicity, flexibility, and wide support for REST API development in Node.js. It allowed for quick scaffolding of authentication routes and integration with middleware for validation, error handling, and token authentication.

---

## ✅ 2. Why Separate Controllers?

Authentication logic was placed in a dedicated `authController.js` to follow the MVC (Model-View-Controller) design pattern. This promotes code modularity, clean routing, and easier debugging and scalability.

---

## ✅ 3. Why Use `.env` for Secrets?

Environment variables store sensitive data like the MongoDB URI and JWT secret. This:

* Prevents credentials from being exposed in version control.
* Allows easy configuration across development, staging, and production.
* Complies with security best practices.

---

## ✅ 4. Mongoose for MongoDB

Mongoose is an ODM (Object Data Modeling) tool that:

* Defines schemas with validation and defaults (e.g., `User` model).
* Simplifies data interactions with built-in methods.
* Helps maintain consistent data structure across the app.

---

## ✅ 5. MongoDB Connection Setup

```js
mongoose.connect(process.env.MONGO_URI)
```

Errors are caught using `.catch()` and logged. If the URI is invalid or missing, a clear error message is shown.

---

## ✅ 6. Registration Flow

* Checks if the email is already registered.
* Hashes password using `bcrypt`.
* Saves the user to MongoDB.
* Returns the user ID upon successful registration.

**Security:** Passwords are never stored in plain text.

---

## ✅ 7. Login Flow with JWT

* Verifies the email exists.
* Compares hashed password using `bcrypt.compare`.
* On success, generates a JWT with `jsonwebtoken`.
* Sends token to client for secure session.

**JWT:** Encodes user ID, signed with `JWT_SECRET`, expires in 2 days.

---

## ✅ 8. API Testing with Postman

### 📮 Register:

```http
POST /api/auth/register
Body: {
  fullName: "User Name",
  email: "user@example.com",
  password: "password123"
}
```

### 🔐 Login:

```http
POST /api/auth/login
Body: {
  email: "user@example.com",
  password: "password123"
}
```

Tests included valid and invalid credentials.

---

## ✅ 9. Common Errors and Fixes

**MongoDB URI error:**

```
The `uri` parameter to `openUri()` must be a string, got "undefined"
```

**Fix:** Ensure `.env` contains MONGO\_URI and that `dotenv.config()` is at the top of `server.js`.

---

## ✅ 10. Key Security Features

* Passwords are hashed (bcrypt, saltRounds=10).
* JWT tokens are signed and expire in 2 days.
* Email uniqueness is enforced in MongoDB.
* `.env` protects secrets.

---

## 📁 Tech Stack

* Node.js + Express.js
* MongoDB + Mongoose
* JWT for auth
* Bcrypt for hashing
* Dotenv for environment management



This sprint showcases my ability to build secure user authentication systems from scratch using Node.js, Express, MongoDB, and JWTs. I handled both the development and architectural reasoning, which aligns with backend engineering and DevOps collaboration.

---
