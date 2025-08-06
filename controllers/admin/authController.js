const jwt = require("jsonwebtoken");

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check if environment variables are set
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("Admin environment variables are not set.");
      return res.status(500).json({
        success: false,
        message: "Server configuration error. Please contact support.",
      });
    }

    // Validate admin credentials
    if (email === adminEmail && password === adminPassword) {
      // Generate JWT token
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });

      return res.json({
        success: true,
        message: "Logged in successfully",
        token,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    console.error("Admin login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const profile = async (req,res)=>{
  try {
    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: "ok"
    });
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

module.exports = { adminLogin ,profile};