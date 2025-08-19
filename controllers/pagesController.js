const db = require("../config/database");


    
// Home page
const getHomeData = async (req, res) => {
  try {
    // 1. Get artists with birthday today
    const [birthdayArtists] = await db.query(`
      SELECT name, image 
      FROM users 
      WHERE DATE_FORMAT(date_of_birth, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d')
      AND image IS NOT NULL
      ORDER BY created_at DESC
    `);

    // Format birthday artists with image URLs
    const formattedBirthdayArtists = birthdayArtists.map((artist) => ({
      name: artist.name,
      image: artist.image
        ? `${req.protocol}://${req.get("host")}/uploads/users/${artist.image}`
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
      image: `${req.protocol}://${req.get("host")}/uploads/artists/${
        artist.image
      }`,
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

// const filterUsers = async (req, res) => {
//   try {
//     const {
//       gender,
//       ageRange,
//       hair_color,
//       body_type,
//       beard,
//       eye_color,
//       city,
//       page = 1,
//       limit = 15,
//     } = req.body || {};

//     let query = `SELECT id, name, date_of_birth, gender, city, image 
//                  FROM users WHERE is_verified = 1`;
//     let countQuery = `SELECT COUNT(*) as total FROM users WHERE is_verified = 1`;
//     let params = [];
//     let countParams = [];

//     // Gender filter
//     if (gender && gender.length > 0) {
//       query += ` AND gender IN (?)`;
//       countQuery += ` AND gender IN (?)`;
//       params.push(gender);
//       countParams.push(gender);
//     }

//     // Age filter
//     if (ageRange && ageRange.length > 0) {
//       let ageConditions = [];
//       ageRange.forEach((range) => {
//         switch (range) {
//           case "0-2":
//             ageConditions.push(
//               "TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 0 AND 2"
//             );
//             break;
//           case "3-5":
//             ageConditions.push(
//               "TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 3 AND 5"
//             );
//             break;
//           case "6-9":
//             ageConditions.push(
//               "TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 6 AND 9"
//             );
//             break;
//           case "10-13":
//             ageConditions.push(
//               "TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 10 AND 13"
//             );
//             break;
//           case "14-17":
//             ageConditions.push(
//               "TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 14 AND 17"
//             );
//             break;
//           case "18-24":
//             ageConditions.push(
//               "TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 18 AND 24"
//             );
//             break;
//           default:
//             break;
//         }
//       });
//       if (ageConditions.length > 0) {
//         const ageSQL = `(${ageConditions.join(" OR ")})`;
//         query += ` AND ${ageSQL}`;
//         countQuery += ` AND ${ageSQL}`;
//       }
//     }

//     // Hair color
//     if (hair_color && hair_color.length > 0) {
//       query += ` AND hair_color IN (?)`;
//       countQuery += ` AND hair_color IN (?)`;
//       params.push(hair_color);
//       countParams.push(hair_color);
//     }

//     // Body type
//     if (body_type && body_type.length > 0) {
//       query += ` AND body_type IN (?)`;
//       countQuery += ` AND body_type IN (?)`;
//       params.push(body_type);
//       countParams.push(body_type);
//     }

//     // Beard
//     if (beard && beard.length > 0) {
//       query += ` AND beard IN (?)`;
//       countQuery += ` AND beard IN (?)`;
//       params.push(beard);
//       countParams.push(beard);
//     }

//     // Eye color
//     if (eye_color && eye_color.length > 0) {
//       query += ` AND eye_color IN (?)`;
//       countQuery += ` AND eye_color IN (?)`;
//       params.push(eye_color);
//       countParams.push(eye_color);
//     }

//     // City
//     if (city && city.length > 0) {
//       query += ` AND city IN (?)`;
//       countQuery += ` AND city IN (?)`;
//       params.push(city);
//       countParams.push(city);
//     }

//     // Count total records
//     const [countResult] = await db.query(countQuery, countParams);
//     const totalRecords = countResult[0].total;
//     const totalPages = Math.ceil(totalRecords / limit);

//     // Pagination
//     const offset = (page - 1) * limit;
//     query += ` LIMIT ? OFFSET ?`;
//     params.push(Number(limit), Number(offset));

//     const [users] = await db.query(query, params);

//     // 🔥 Convert image filename -> full URL
  //  const baseUrl = `${req.protocol}://${req.get("host")}/uploads/user_media/`;
//     const formattedUsers = users.map((user) => ({
//       id: user.id,
//       name: user.name,
//       age:
//         new Date().getFullYear() - new Date(user.date_of_birth).getFullYear(),
//       gender: user.gender,
//       city: user.city,
//       image: user.image ? baseUrl + user.image : null,
//     }));

//     res.status(200).json({
//       success: true,
//       page: Number(page),
//       limit: Number(limit),
//       totalRecords,
//       totalPages,
//       count: formattedUsers.length,
//       data: formattedUsers,
//     });
//   } catch (error) {
//     console.error("❌ filterUsers error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };


const filterUsers = async (req, res) => {
  try {

    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/user_media/`;
    
    const query = `SELECT name, date_of_birth, gender, city, image 
                   FROM users WHERE is_verified = 1`;

    const [users] = await db.query(query);

    // Convert image filename -> full URL
    const Users = users.map((user) => ({
      name: user.name,
      age: new Date().getFullYear() - new Date(user.date_of_birth).getFullYear(),
      gender: user.gender,
      city: user.city,
      image: user.image ? baseUrl + user.image : null,
    }));

    res.status(200).json({
      success: true,
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
