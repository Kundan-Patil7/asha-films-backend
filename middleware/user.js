const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Check for token in headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET );

    // Attach decoded user info to request
    req.user = decoded;

    next(); // continue to next middleware/route
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
