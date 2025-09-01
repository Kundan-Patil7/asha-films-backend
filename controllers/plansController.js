const db = require("../config/database");


// ✅ Ensure plans table exists
const ensurePlansTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS plans (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE,
      price DECIMAL(10,2) DEFAULT 0.00,
      duration_in_days INT DEFAULT 30,

      verified_actor_badge BOOLEAN DEFAULT FALSE,
      consolidated_profile BOOLEAN DEFAULT FALSE,
      free_learning_videos BOOLEAN DEFAULT FALSE,
      regional_access BOOLEAN DEFAULT FALSE,
      bollywood_access BOOLEAN DEFAULT FALSE,
      tollywood_access BOOLEAN DEFAULT FALSE,
      pan_india_access BOOLEAN DEFAULT FALSE,
      direct_contact_cd BOOLEAN DEFAULT FALSE,
      unlimited_applications BOOLEAN DEFAULT FALSE,

      email_alerts BOOLEAN DEFAULT FALSE,
      whatsapp_alerts BOOLEAN DEFAULT FALSE,
      whatsapp_alerts_frequency ENUM('None','Daily','MWF','Weekly') DEFAULT 'None',

      max_pics_upload INT DEFAULT 0,
      max_intro_videos INT DEFAULT 0,
      max_audition_videos INT DEFAULT 0,
      max_work_links INT DEFAULT 0,

      masterclass_access BOOLEAN DEFAULT FALSE,
      showcase_featured BOOLEAN DEFAULT FALSE,
      reward_points_on_testimonial INT DEFAULT 0,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
};

// ✅ Create new plan
const createPlan = async (req, res) => {
  try {
    await ensurePlansTable();

    const {
      name,
      price,
      duration_in_days,
      verified_actor_badge,
      consolidated_profile,
      free_learning_videos,
      regional_access,
      bollywood_access,
      tollywood_access,
      pan_india_access,
      direct_contact_cd,
      unlimited_applications,
      email_alerts,
      whatsapp_alerts,
      whatsapp_alerts_frequency,
      max_pics_upload,
      max_intro_videos,
      max_audition_videos,
      max_work_links,
      masterclass_access,
      showcase_featured,
      reward_points_on_testimonial
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO plans 
      (name, price, duration_in_days, verified_actor_badge, consolidated_profile, free_learning_videos,
       regional_access, bollywood_access, tollywood_access, pan_india_access, direct_contact_cd,
       unlimited_applications, email_alerts, whatsapp_alerts, whatsapp_alerts_frequency,
       max_pics_upload, max_intro_videos, max_audition_videos, max_work_links,
       masterclass_access, showcase_featured, reward_points_on_testimonial)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        price,
        duration_in_days,
        verified_actor_badge,
        consolidated_profile,
        free_learning_videos,
        regional_access,
        bollywood_access,
        tollywood_access,
        pan_india_access,
        direct_contact_cd,
        unlimited_applications,
        email_alerts,
        whatsapp_alerts,
        whatsapp_alerts_frequency,
        max_pics_upload,
        max_intro_videos,
        max_audition_videos,
        max_work_links,
        masterclass_access,
        showcase_featured,
        reward_points_on_testimonial
      ]
    );

    res.status(201).json({ message: "Plan created successfully", planId: result.insertId });
  } catch (error) {
    console.error("❌ Error creating plan:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ✅ Get all plans
const getPlans = async (req, res) => {
  try {
    await ensurePlansTable();
    const [plans] = await db.query("SELECT * FROM plans ORDER BY id ASC");
    res.status(200).json(plans);
  } catch (error) {
    console.error("❌ Error fetching plans:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ✅ Get plan by ID
const getPlanById = async (req, res) => {
  try {
    await ensurePlansTable();
    const { id } = req.params;
    const [plan] = await db.query("SELECT * FROM plans WHERE id = ?", [id]);

    if (plan.length === 0) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.status(200).json(plan[0]);
  } catch (error) {
    console.error("❌ Error fetching plan by ID:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ✅ Update plan
const updatePlan = async (req, res) => {
  try {
    await ensurePlansTable();
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates).map((key) => `${key} = ?`).join(", ");
    const values = Object.values(updates);

    const [result] = await db.query(
      `UPDATE plans SET ${fields} WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.status(200).json({ message: "Plan updated successfully" });
  } catch (error) {
    console.error("❌ Error updating plan:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ✅ Delete plan
const deletePlan = async (req, res) => {
  try {
    await ensurePlansTable();
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM plans WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.status(200).json({ message: "Plan deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting plan:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan
};
