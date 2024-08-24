const express = require('express');
const { createPool } = require('mysql');
const bodyParser = require('body-parser');
require('dotenv').config(); // Ensure this is called before using any environment variables

const app = express();
const PORT = process.env.PORT || 3010;

// Create a MySQL connection pool
const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Riya19@',
  database: process.env.DB_NAME || 'school_management',
  connectionLimit: 10,
});

// Middleware to parse JSON bodies
app.use(express.json());

// Define a route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the School Management API!');
});

// Add School API
app.post('/addSchool', (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  // Validate the input data
  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Insert the new school into the database
  pool.query(
    'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
    [name, address, latitude, longitude],
    (err, result) => {
      if (err) {
        console.error('Error inserting data:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ message: 'School added successfully!', id: result.insertId });
    }
  );
});

// List Schools API
app.get('/listSchools', (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  // SQL query to calculate the distance between the user's location and each school's location
  const query = `
    SELECT 
      id, name, address, latitude, longitude,
      (6371 * 
       acos(
         cos(radians(?)) * cos(radians(latitude)) *
         cos(radians(longitude) - radians(?)) + 
         sin(radians(?)) * sin(radians(latitude))
       )
      ) AS distance 
    FROM schools
    ORDER BY distance;
  `;

  // Execute the query
  pool.query(query, [latitude, longitude, latitude], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
