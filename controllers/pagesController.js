const db = require("../config/database");

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
    const formattedBirthdayArtists = birthdayArtists.map(artist => ({
      name: artist.name,
      image: artist.image 
        ? `${req.protocol}://${req.get('host')}/uploads/users/${artist.image}`
        : null
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
    const formattedJobs = latestJobs.map(job => ({
      id: job.id,
      project_type: job.project_type,
      project_description: job.project_description.substring(0, 100) + '...',
      city_location: job.city_location,
    
      posted_on: job.created_at
    }));

    // 3. Get all featured artists
    const [featuredArtists] = await db.query(`
      SELECT image 
      FROM featured_artists
      ORDER BY created_at DESC
    `);

    // Format featured artists with image URLs
    const formattedFeaturedArtists = featuredArtists.map(artist => ({
      image: `${req.protocol}://${req.get('host')}/uploads/artists/${artist.image}`
    }));

    res.status(200).json({
      success: true,
      data: {
        birthday_artists: formattedBirthdayArtists,
        latest_jobs: formattedJobs,
        featured_artists: formattedFeaturedArtists
      }
    });

  } catch (error) {
    console.error('❌ getDashboardData error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};


module.exports = {
    getHomeData
} 