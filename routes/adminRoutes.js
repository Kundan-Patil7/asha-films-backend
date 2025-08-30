const express = require("express");
const { adminLogin, profile } = require("../controllers/admin/authController");
const verifyAdmin = require("../middleware/admin");
const { fetchTickets, allUsers, blockUser, suspendUser, unsuspendUser, changePlan, approveJob } = require("../controllers/admin/dashboardController");
const router = express.Router();

// Admin login
router.post("/admin/login", adminLogin);

// Protected route: Admin profile
router.get("/admin/profile", verifyAdmin , profile);





// Ticket Management
router.get("/admin/tickets", fetchTickets);

// User Management
router.get("/admin/users", allUsers);
router.put("/admin/users/block", blockUser);
router.put("/admin/users/suspend", suspendUser);
router.put("/admin/users/unsuspend", unsuspendUser);
router.put("/admin/users/change-plan", changePlan);


//approveJob
router.put("/admin/jobs/approve", approveJob); // approve job (jobId in body)



module.exports = router;
