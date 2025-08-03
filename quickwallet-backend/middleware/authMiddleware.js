const jwt = require("jsonwebtoken");
const prisma = require('../prismaClient')


const authMiddleware = async (req, res, next) => {
  let token;

  if ( 
    req.headers.authorization && 
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  
     if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ message: "User doesn't exists" });
    }
  

    req.user = { id: user.id };
    next();

  } catch (error) {
    res.status(401).json({ 
      message: "Invalid token",
    error: error.message
   });
  }

};

module.exports = authMiddleware;
