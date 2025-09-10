const db = require("../config/database");


    
// Home page
const getHomeData = async (req, res) => {
  try {
    // 1. Get artists with birthday today (FIXED)
    const [birthdayArtists] = await db.query(`
      SELECT name, image 
      FROM users 
      WHERE DATE_FORMAT(date_of_birth, '%m-%d') = DATE_FORMAT(UTC_DATE(), '%m-%d')
      AND image IS NOT NULL
      AND is_verified = 1
      ORDER BY created_at DESC
    `);

   
    // Format birthday artists with image URLs
    const formattedBirthdayArtists = birthdayArtists.map((artist) => ({
      name: artist.name,
      image: artist.image
        ? `${req.protocol}://${req.get("host")}/uploads/user_media/${artist.image}`
        : null,
    }));

    // 2. Get latest 2 job posts
    const [latestJobs] = await db.query(`
      SELECT 
        id,
        project_type,
        project_description,
        city_location,
        image,
        created_at
      FROM job
      ORDER BY created_at DESC
      LIMIT 2
    `);

    // Format job posts with image URLs
    const formattedJobs = latestJobs.map((job) => ({
      id: job.id,
      project_type: job.project_type,
      project_description: job.project_description.substring(0, 100) + "...",
      city_location: job.city_location,
      posted_on: job.created_at,
    }));

    // 3. Get all featured artists
    const [featuredArtists] = await db.query(`
      SELECT image 
      FROM featured_artists
      ORDER BY created_at DESC
    `);

    // Format featured artists with image URLs
    const formattedFeaturedArtists = featuredArtists.map((artist) => ({
      image: `${req.protocol}://${req.get("host")}/uploads/artists/${artist.image}`,
    }));

    res.status(200).json({
      success: true,
      data: {
        birthday_artists: formattedBirthdayArtists,
        latest_jobs: formattedJobs,
        featured_artists: formattedFeaturedArtists,
      },
    });
  } catch (error) {
    console.error("❌ getDashboardData error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};



const filterUsers = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/user_media/`;

    // Extract filters + pagination + sorting
    const {
      gender = [],
      ageRange = [],
      hair_color = [],
      body_type = [],
      beard = [],
      eye_color = [],
      dob_from,
      dob_to,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10,
    } = req.body;

    // Base query
    let query = `
      SELECT 
        id,
        name,
        date_of_birth,
        gender,
        city,
        image,
        hair_color,
        body_type,
        beard,
        eye_color
      FROM users 
      WHERE is_verified = 1
    `;
    const values = [];

    // Gender filter
    if (Array.isArray(gender) && gender.length > 0) {
      query += ` AND gender IN (?)`;
      values.push(gender);
    }

    // Age range filter
    if (Array.isArray(ageRange) && ageRange.length > 0) {
      const ageConditions = ageRange.map((range) => {
        const [min, max] = range.split("-").map(Number);
        const currentYear = new Date().getFullYear();
        const minDob = `${currentYear - max}-01-01`;
        const maxDob = `${currentYear - min}-12-31`;
        return `(date_of_birth BETWEEN '${minDob}' AND '${maxDob}')`;
      });
      query += ` AND (${ageConditions.join(" OR ")})`;
    }

    // Direct DOB filter
    if (dob_from && dob_to) {
      query += ` AND date_of_birth BETWEEN ? AND ?`;
      values.push(dob_from, dob_to);
    }

    // Other filters
    if (Array.isArray(hair_color) && hair_color.length > 0) {
      query += ` AND hair_color IN (?)`;
      values.push(hair_color);
    }
    if (Array.isArray(body_type) && body_type.length > 0) {
      query += ` AND body_type IN (?)`;
      values.push(body_type);
    }
    if (Array.isArray(beard) && beard.length > 0) {
      query += ` AND beard IN (?)`;
      values.push(beard);
    }
    if (Array.isArray(eye_color) && eye_color.length > 0) {
      query += ` AND eye_color IN (?)`;
      values.push(eye_color);
    }

    // Sorting (whitelist fields)
    const allowedSort = ["date_of_birth", "name", "created_at"];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : "created_at";
    const safeSortOrder =
      sortOrder && sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";
    query += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    values.push(Number(limit), Number(offset));

    // Run query
    const [users] = await db.query(query, values);

    // Count total users (without LIMIT/OFFSET)
    const [countResult] = await db.query(
      `
      SELECT COUNT(*) as total
      FROM users
      WHERE is_verified = 1
    `
    );
    const totalCount = countResult[0].total;

    // Transform result
    const Users = users.map((user) => {
      const dob = user.date_of_birth ? new Date(user.date_of_birth) : null;
      const age = dob
        ? new Date().getFullYear() - dob.getFullYear()
        : null;

      return {
        id: user.id,
        name: user.name,
        age,
        date_of_birth: user.date_of_birth,
        gender: user.gender || null,
        city: user.city || null,
        hair_color: user.hair_color || null,
        body_type: user.body_type || null,
        beard: user.beard || null,
        eye_color: user.eye_color || null,
        image: user.image ? baseUrl + user.image : null,
      };
    });

    res.status(200).json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      total: totalCount,
      count: Users.length,
      data: Users,
    });
  } catch (error) {
    console.error("❌ filterUsers error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



module.exports = {
  getHomeData,
  filterUsers,
};
