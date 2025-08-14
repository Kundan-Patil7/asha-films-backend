const express = require("express");

const { getHomeData } = require("../controllers/pagesController");


const router = express.Router();
// Home Page Route

router.get('/home', getHomeData );



// Export the router
module.exports = router;