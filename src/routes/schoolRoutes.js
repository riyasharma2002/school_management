const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');

// Define route for adding a new school
router.post('/addSchool', schoolController.addSchool);

// Define route for listing schools
router.get('/listSchools', schoolController.getSchools);

module.exports = router;
