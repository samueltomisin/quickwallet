const jwt = require("jsonwebtoken");

const generateToken = (userId) => {

    if (!userId) {
    throw new Error("User ID is required to generate token");
  }

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = generateToken;
