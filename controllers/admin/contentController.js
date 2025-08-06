/**
 * Optimized Banners and About Us Content Management
 */

const db = require("../../config/database");
const path = require("path");
const fs = require("fs");
const util = require("util");

// Promisify file system functions
const existsAsync = util.promisify(fs.exists);
const unlinkAsync = util.promisify(fs.unlink);

// Constants
const BANNER_DIR = path.join(process.cwd(), "uploads", "banners");

// Helper function to remove file if exists
async function removeFileIfExists(filePath) {
  if (await existsAsync(filePath)) {
    await unlinkAsync(filePath);
  }
}

// Helper function to build file URL
function buildFileUrl(req, filename, folder = "banners") {
  return `${req.protocol}://${req.get("host")}/uploads/${folder}/${filename}`;
}

// Initialize banners table
async function initBannersTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS banners (
      id INT PRIMARY KEY AUTO_INCREMENT,
      image_path VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Seed initial banners if needed
  const [rows] = await db.query("SELECT id FROM banners");
  const existingIds = rows.map((r) => r.id);

  if (!existingIds.includes(1)) {
    await db.query("INSERT INTO banners (id) VALUES (1)");
  }
  if (!existingIds.includes(2)) {
    await db.query("INSERT INTO banners (id) VALUES (2)");
  }
}

// Get all banners
const getBanners = async (req, res) => {
  try {
    const [banners] = await db.query(`
      SELECT id, image_path, updated_at AS updatedAt 
      FROM banners 
      ORDER BY id ASC
    `);

    if (!banners.length) {
      return res.status(404).json({
        success: false,
        message: "No banners found",
      });
    }

    const bannersWithUrls = banners.map((banner) => ({
      id: banner.id,
      filename: banner.image_path,
      url: buildFileUrl(req, banner.image_path),
      updatedAt: banner.updatedAt,
    }));

    res.status(200).json({
      success: true,
      message: "Banners fetched successfully",
      banners: bannersWithUrls,
    });
  } catch (err) {
    console.error("Error fetching banners:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
      error: err.message,
    });
  }
};

// Update a banner
const updateBanner = async (req, res) => {
  const bannerId = parseInt(req.params.id) || 1;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No banner image uploaded",
    });
  }

  const tempFilePath = req.file.path;

  try {
    await initBannersTable();

    // Get current banner
    const [[banner]] = await db.query(
      "SELECT image_path FROM banners WHERE id = ?",
      [bannerId]
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // Remove old image if exists
    if (banner.image_path) {
      const oldPath = path.join(BANNER_DIR, banner.image_path);
      if (oldPath !== tempFilePath) {
        await removeFileIfExists(oldPath);
      }
    }

    // Update with new image
    const newFilename = req.file.filename;
    await db.query("UPDATE banners SET image_path = ? WHERE id = ?", [
      newFilename,
      bannerId,
    ]);

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      banner: {
        id: bannerId,
        filename: newFilename,
        url: buildFileUrl(req, newFilename),
      },
    });
  } catch (err) {
    console.error("Error updating banner:", err);

    // Clean up temp file on error
    if (await existsAsync(tempFilePath)) {
      await removeFileIfExists(tempFilePath);
    }

    res.status(500).json({
      success: false,
      message: "Failed to update banner",
      error: err.message,
    });
  }
};

// Initialize about_us table
async function initAboutUsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS about_us (
      id INT PRIMARY KEY AUTO_INCREMENT,
      html_content LONGTEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Seed initial row if needed
  const [[exists]] = await db.query("SELECT id FROM about_us WHERE id = 1");
  if (!exists) {
    await db.query("INSERT INTO about_us (id) VALUES (1)");
  }
}

// Get About Us content
const getAboutUs = async (req, res) => {
  try {
    await initAboutUsTable();

    const [[aboutUs]] = await db.query(`
      SELECT html_content AS html, updated_at AS updatedAt 
      FROM about_us 
      WHERE id = 1
    `);

    if (!aboutUs?.html) {
      return res.status(404).json({
        success: false,
        message: "No About Us content found",
      });
    }

    res.status(200).json({
      success: true,
      message: "About Us content fetched successfully",
      aboutUs,
    });
  } catch (err) {
    console.error("Error fetching About Us:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch About Us content",
      error: err.message,
    });
  }
};

// Update About Us content
const updateAboutUs = async (req, res) => {
  const { htmlContent } = req.body;

  if (!htmlContent) {
    return res.status(400).json({
      success: false,
      message: "HTML content is required",
    });
  }

  try {
    await initAboutUsTable();

    await db.query("UPDATE about_us SET html_content = ? WHERE id = 1", [
      htmlContent,
    ]);

    res.status(200).json({
      success: true,
      message: "About Us content updated successfully",
    });
  } catch (err) {
    console.error("Error updating About Us:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update About Us content",
      error: err.message,
    });
  }
};

module.exports = {
  getBanners,
  updateBanner,
  getAboutUs,
  updateAboutUs,
};
