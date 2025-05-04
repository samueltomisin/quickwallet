# SwiftPay Backend - Sprint 1 Documentation

## 🚀 **Objective**:  
- Set up the backend for user authentication (register/login).
- Implement JWT-based authentication and MongoDB integration.

## 🛠️ **What We Did**:

1. **Set Up the Project**:
   - Initialized the Node.js project with `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, and other dependencies.
   
2. **Backend Structure**:
   - Defined folder structure with models (`User`, `Transaction`), routes (`authRoutes`), and controllers (`authController`).
   
3. **User Authentication**:
   - Created `POST /api/auth/register` for user registration.
   - Created `POST /api/auth/login` for user login with JWT token generation.

4. **MongoDB Integration**:
   - Connected to MongoDB using `mongoose` and MongoDB Atlas.
   
5. **Environment Variables**:  
   - Configured `.env` for storing sensitive information like MongoDB URI and JWT secret.

## 💡 **Challenges**:
- Handling environment variables properly and making sure they load correctly.
- Debugging `MONGO_URI` connection errors during the first run.

## 🔧 **Tools & Technologies Used**:
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, MongoDB Atlas
- **Authentication**: JWT, bcryptjs
- **Dev Tools**: Postman for API testing

## 🔗 **Links**:
- **GitHub Repository**: [GitHub Link]
