const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// Auth middleware
const productionAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Token missing" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }

      req.user = decoded; // Save user data in request
      next();
    });
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = productionAuth;
