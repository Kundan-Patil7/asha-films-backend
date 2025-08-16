/**
 * Optimized Content Management Controller
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
const POSTER_DIR = path.join(process.cwd(), "uploads", "posters");
const CLIENT_DIR = path.join(process.cwd(), "uploads", "clients");
const ARTIST_DIR = path.join(process.cwd(), "uploads", "artists");

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
      image VARCHAR(255),
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
      SELECT id, image, updated_at AS updatedAt 
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
      filename: banner.image,
      url: buildFileUrl(req, banner.image),
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
      "SELECT image FROM banners WHERE id = ?",
      [bannerId]
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // Remove old image if exists
    if (banner.image) {
      const oldPath = path.join(BANNER_DIR, banner.image);
      if (oldPath !== tempFilePath) {
        await removeFileIfExists(oldPath);
      }
    }

    // Update with new image
    const newFilename = req.file.filename;
    await db.query("UPDATE banners SET image = ? WHERE id = ?", [
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

// Initialize projects table
async function initProjectsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id INT PRIMARY KEY AUTO_INCREMENT,
      film_title VARCHAR(255) NOT NULL,
      genre VARCHAR(100),
      directed_by VARCHAR(255),
      produced_by VARCHAR(255),
      released_year INT,
      language VARCHAR(100),
      platform VARCHAR(100),
      about_project TEXT,
      type ENUM('Movies','Web Series','Advertisement') DEFAULT 'Movies',
      image VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}

// Create new project
const createProject = async (req, res) => {
  try {
    await initProjectsTable();

    const {
      film_title,
      genre,
      directed_by,
      produced_by,
      released_year,
      language,
      platform,
      about_project,
      type,
    } = req.body;

    if (!film_title) {
      return res.status(400).json({
        success: false,
        message: "Film title is required",
      });
    }

    const imageFilename = req.file ? req.file.filename : null;

    await db.query(
      `INSERT INTO projects 
      (film_title, genre, directed_by, produced_by, released_year, language, platform, about_project, type, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        film_title,
        genre,
        directed_by,
        produced_by,
        released_year,
        language,
        platform,
        about_project,
        type || "Movies",
        imageFilename,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Project created successfully",
    });
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: err.message,
    });
  }
};

// Get all projects (with optional filter by type)
const getProjects = async (req, res) => {
  try {
    await initProjectsTable();

    const { type } = req.query;
    let query = "SELECT * FROM projects";
    const params = [];

    if (type && ["Movies", "Web Series", "Advertisement"].includes(type)) {
      query += " WHERE type = ?";
      params.push(type);
    }

    query += " ORDER BY created_at DESC";

    const [projects] = await db.query(query, params);

    const projectsWithUrls = projects.map((project) => ({
      ...project,
      image_url: project.image
        ? buildFileUrl(req, project.image, "posters")
        : null,
    }));

    res.status(200).json({
      success: true,
      message: "Projects fetched successfully",
      projects: projectsWithUrls,
    });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: err.message,
    });
  }
};

// Get project by ID
const getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    await initProjectsTable();

    const [[project]] = await db.query("SELECT * FROM projects WHERE id = ?", [
      id,
    ]);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Add image URL if available
    const projectWithUrl = {
      ...project,
      image_url: project.image
        ? buildFileUrl(req, project.image, "posters")
        : null,
    };

    res.status(200).json({
      success: true,
      message: "Project fetched successfully",
      project: projectWithUrl,
    });
  } catch (err) {
    console.error("Error fetching project:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project",
      error: err.message,
    });
  }
};

// Update project
const updateProject = async (req, res) => {
  const { id } = req.params;

  try {
    await initProjectsTable();

    const [[project]] = await db.query("SELECT * FROM projects WHERE id = ?", [
      id,
    ]);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const imageFilename = req.file ? req.file.filename : project.image;

    // Remove old image if new one uploaded
    if (req.file && project.image) {
      const oldPath = path.join(POSTER_DIR, project.image);
      await removeFileIfExists(oldPath);
    }

    const {
      film_title,
      genre,
      directed_by,
      produced_by,
      released_year,
      language,
      platform,
      about_project,
      type,
    } = req.body;

    await db.query(
      `UPDATE projects SET film_title=?, genre=?, directed_by=?, produced_by=?, 
        released_year=?, language=?, platform=?, about_project=?, type=?, image=? 
        WHERE id=?`,
      [
        film_title || project.film_title,
        genre || project.genre,
        directed_by || project.directed_by,
        produced_by || project.produced_by,
        released_year || project.released_year,
        language || project.language,
        platform || project.platform,
        about_project || project.about_project,
        type || project.type,
        imageFilename,
        id,
      ]
    );

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
    });
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update project",
      error: err.message,
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const [[project]] = await db.query("SELECT * FROM projects WHERE id = ?", [
      id,
    ]);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Delete image if exists
    if (project.image) {
      const oldPath = path.join(POSTER_DIR, project.image);
      await removeFileIfExists(oldPath);
    }

    await db.query("DELETE FROM projects WHERE id = ?", [id]);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete project",
      error: err.message,
    });
  }
};

// Get projects by type (Movies, Web Series, Advertisement)
const getProjectsByType = async (req, res) => {
  const { type } = req.params;

  try {
    await initProjectsTable();

    // Validate type
    const validTypes = ["Movies", "Web Series", "Advertisement"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project type",
      });
    }

    const [projects] = await db.query("SELECT * FROM projects WHERE type = ?", [
      type,
    ]);

    if (!projects.length) {
      return res.status(404).json({
        success: false,
        message: `No projects found for type: ${type}`,
      });
    }

    const projectsWithUrls = projects.map((project) => ({
      ...project,
      image_url: project.image
        ? buildFileUrl(req, project.image, "posters")
        : null,
    }));

    res.status(200).json({
      success: true,
      message: `${type} projects fetched successfully`,
      projects: projectsWithUrls,
    });
  } catch (err) {
    console.error("Error fetching projects by type:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects by type",
      error: err.message,
    });
  }
};

// Initialize clients table
async function initClientsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      image VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}

// Create client (POST)
const createClient = async (req, res) => {
  try {
    await initClientsTable();

    // Check profile image
    const profileImage = req.files["image"] ? req.files["image"][0].filename : null;

    // Check gallery images
    const galleryImages = req.files["images"] 
      ? req.files["images"].map((file) => file.filename) 
      : [];

    if (!profileImage && galleryImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one client image is required",
      });
    }

    // Insert profile image
    if (profileImage) {
      await db.query("INSERT INTO clients (image) VALUES (?)", [profileImage]);
    }

    // Insert gallery images
    for (const filename of galleryImages) {
      await db.query("INSERT INTO clients (image) VALUES (?)", [filename]);
    }

    res.status(201).json({
      success: true,
      message: "Clients added successfully",
      profileImage,
      galleryImages,
    });
  } catch (err) {
    console.error("Error creating client:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create clients",
      error: err.message,
    });
  }
};



// Get all clients (GET)
const getClients = async (req, res) => {
  try {
    await initClientsTable();

    const [clients] = await db.query(
      "SELECT * FROM clients ORDER BY created_at DESC"
    );

    if (!clients.length) {
      return res.status(404).json({
        success: false,
        message: "No clients found",
      });
    }

    const clientsWithUrls = clients.map((client) => ({
      ...client,
      image_url: client.image
        ? buildFileUrl(req, client.image, "clients")
        : null,
    }));

    res.status(200).json({
      success: true,
      message: "Clients fetched successfully",
      clients: clientsWithUrls,
    });
  } catch (err) {
    console.error("Error fetching clients:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch clients",
      error: err.message,
    });
  }
};

// Delete client (DELETE)
const deleteClient = async (req, res) => {
  const { id } = req.params;

  try {
    const [[client]] = await db.query("SELECT * FROM clients WHERE id = ?", [
      id,
    ]);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Remove image if exists
    if (client.image) {
      const oldPath = path.join(CLIENT_DIR, client.image);
      await removeFileIfExists(oldPath);
    }

    await db.query("DELETE FROM clients WHERE id = ?", [id]);

    res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting client:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete client",
      error: err.message,
    });
  }
};

// Featured Artists
const addFeaturedArtist = async (req, res) => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS featured_artists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });
    }

    const imagePath = req.file.filename;

    const [result] = await db.query(
      "INSERT INTO featured_artists (image) VALUES (?)",
      [imagePath]
    );

    res.status(201).json({
      success: true,
      message: "Featured artist added successfully",
      data: { id: result.insertId, image: imagePath },
    });
  } catch (error) {
    console.error("Error adding featured artist:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAllFeaturedArtists = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM featured_artists");

    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/artists/`;

    const artists = rows.map((artist) => ({
      id: artist.id,
      image: baseUrl + artist.image,
      created_at: artist.created_at,
    }));

    res.status(200).json({
      success: true,
      data: artists,
    });
  } catch (error) {
    console.error("Error fetching featured artists:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteFeaturedArtist = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT image FROM featured_artists WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Artist not found" });
    }

    const imagePath = path.join(ARTIST_DIR, rows[0].image);

    // Delete image from folder
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete record from DB
    await db.query("DELETE FROM featured_artists WHERE id = ?", [id]);

    res
      .status(200)
      .json({ success: true, message: "Featured artist deleted successfully" });
  } catch (error) {
    console.error("Error deleting artist:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
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
  createClient,
  getClients,
  deleteClient,
  addFeaturedArtist,
  getAllFeaturedArtists,
  deleteFeaturedArtist,
};
