const express = require("express");
const {
  getBanners,
  updateBanner,
  getAboutUs,
  updateAboutUs,
} = require("../controllers/admin/contentController");
const bannerUpload = require("../middleware/banners");
const router = express.Router();

// Banner Routes
router.get("/banners", getBanners);
router.put("/banners/:id", bannerUpload, updateBanner);

// About Us Routes
router.get("/about-us", getAboutUs);
router.put("/about-us", updateAboutUs);

module.exports = router;
