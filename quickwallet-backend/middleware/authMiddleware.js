const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = (req, res, next) => {
  let token;

  if ( 
    req.headers.authorization && 
    req.headers.authorization.startsWith("Bearer")
  ) {
  
  try {
    token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    next();

  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }

 if (!token) {return res.status(401).json({ message: "No token provided" });
} 
  }
};

module.exports = authMiddleware;
