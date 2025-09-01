const express = require("express");
const {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan
} = require("../controllers/plansController");

const router = express.Router();

router.post("/", createPlan);
router.get("/", getPlans);
router.get("/:id", getPlanById);
router.put("/:id", updatePlan);
router.delete("/:id", deletePlan);

module.exports = router;
