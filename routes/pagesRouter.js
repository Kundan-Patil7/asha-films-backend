const express = require("express");

const { getHomeData, filterUsers } = require("../controllers/pagesController");


const router = express.Router();
// Home Page Route

router.get('/home', getHomeData );

router.get("/filter", filterUsers);

// Export the router
module.exports = router;