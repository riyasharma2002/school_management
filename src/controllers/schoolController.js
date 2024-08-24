// src/controllers/schoolController.js

const db = require('../utils/db.js'); // Import the database connection

// Controller function to add a new school
exports.addSchool = async (req, res) => {
  const { name, address, latitude, longitude } = req.body; // Destructure the request body to get school details

  try {
    // Execute the SQL query to insert a new school into the database
    const [result] = await db.execute(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, latitude, longitude]
    );

    // Send a response indicating the school was added successfully
    res.status(201).json({ message: 'School added successfully!', schoolId: result.insertId });
  } catch (error) {
    // Send an error response if something goes wrong
    res.status(500).json({ error: error.message });
  }
};

// Controller function to get schools sorted by proximity
exports.getSchools = async (req, res) => {
  const { latitude, longitude } = req.query; // Get latitude and longitude from query parameters

  if (!latitude || !longitude) {
    return res.status(400).json({ message: 'Latitude and Longitude are required.' }); // Validate request parameters
  }

  try {
    // Execute the SQL query to retrieve schools sorted by distance from the specified location
    const [schools] = await db.execute(
      `SELECT id, name, address, latitude, longitude, 
      (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance 
      FROM schools 
      ORDER BY distance`,
      [latitude, longitude, latitude]
    );

    // Send a response with the list of schools sorted by proximity
    res.status(200).json(schools);
  } catch (error) {
    // Send an error response if something goes wrong
    res.status(500).json({ error: error.message });
  }
};

