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
  resendProductionHouseOTP,
  getAllApplicationsByProduction,
  getApplicationsByJob,
  MyJobPostings,
  getPreviousJobs,
  getUpcomingProjects,
  getRejectedJobs,
  
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

// Resend OTP for production house
router.post("/resend-otp", resendProductionHouseOTP);

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
  jobCoverImageUpload.single("image"),
  addJob
);

router.put(
  "/jobs/:id",
  productionAuth,
  jobCoverImageUpload.single("image"),
  editJob
);
// Delete Job

router.get("/jobs", getAllJobs);




// all jobs by production 




router.get("/applications", productionAuth, MyJobPostings);
router.get("/applications/all" ,productionAuth, getAllApplicationsByProduction);

router.get("/applications/:id", productionAuth, getApplicationsByJob);

router.get("/jobs/previous", productionAuth, getPreviousJobs);    
router.get("/jobs/upcoming", productionAuth, getUpcomingProjects);
router.get("/jobs/rejected", productionAuth, getRejectedJobs);


router.get("/jobs/:id", getJobById);
router.delete("/jobs/:id", productionAuth, deleteJob);









module.exports = router;
