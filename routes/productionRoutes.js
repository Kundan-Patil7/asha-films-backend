// routes/productionHouseRoutes.js
const express = require("express");
const router = express.Router();

const {
  registerProductionHouse,
  loginProductionHouse,
  verifyProductionHouseOTP,
  forgotProductionHousePassword,
  resetProductionHousePassword,
  getProductionHouseProfile,
  updateProductionHouseProfile,
  addJob,
  editJob,
  deleteJob,
  getAllJobs,
  getJobById,
} = require("../controllers/productionController");
const productionProfileImage = require("../middleware/productionProfileImg");
const productionAuth = require("../middleware/productionAuth");
const jobCoverImageUpload = require("../middleware/job");



// Register production house
router.post("/register", registerProductionHouse);

// Login production house
router.post("/login", loginProductionHouse);

// Verify OTP
router.post("/verify", verifyProductionHouseOTP);

// Forgot password - send OTP
router.post("/forgot-password", forgotProductionHousePassword);

// Reset password
router.post("/reset-password", resetProductionHousePassword);

// Get profile - protected route
router.get("/profile", productionAuth, getProductionHouseProfile);



// Update profile - protected route + upload image
router.put(
  "/profile",
  productionAuth,
  productionProfileImage.single("image"),
  updateProductionHouseProfile
);




// job 

router.post(
  "/jobs",
  productionAuth, 
  jobCoverImageUpload.single("cover_photo"),
  addJob
);

router.put(
  "/jobs/:id",
  productionAuth, 
  jobCoverImageUpload.single("cover_photo"),
  editJob
);
// Delete Job
router.delete("/jobs/:id",productionAuth, deleteJob);


router.get("/jobs", getAllJobs);


router.get("/jobs/:id", getJobById);

module.exports = router;
