const express = require("express");
const {
  getBanners,
  updateBanner,
  getAboutUs,
  updateAboutUs,
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  getProjectById,
  getProjectsByType,
} = require("../controllers/admin/contentController");
const bannerUpload = require("../middleware/banners");
const posterUpload = require("../middleware/poster");
const router = express.Router();

// Banner Routes
router.get("/banners", getBanners);
router.put("/banners/:id", bannerUpload, updateBanner);

// About Us Routes
router.get("/about-us", getAboutUs);
router.put("/about-us", updateAboutUs);

//  projects
router.post("/projects", posterUpload, createProject);
router.get("/projects", getProjects);
router.put("/projects/:id", posterUpload, updateProject);
router.delete("/projects/:id", deleteProject);
router.get("/projects/:id", getProjectById);
router.get("/projects/type/:type", getProjectsByType);

module.exports = router;
