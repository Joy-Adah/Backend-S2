const express = require('express');

const dotenv = require('dotenv').config();

const bodyParser = require('body-parser');

const mysql = require('mysql');

const app = express();

const port = process.env.PORT || 3306;

 // MySQL connection
const db = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

db.getConnection((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Middleware
app.use(bodyParser.json());

// Data Validation Middleware
const validateName = (req, res, next) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    res.status(400).json({ error: 'Name required' });
  } else {
    next();
  }
};

// Getting users
app.get('/api/', (req, res) => {
  const query = 'SELECT * FROM persons';
  db.query(query, (error, results) => {
    if (error) {
      console.error('Error retrieving users:', error);
      res.status(500).json({ error: 'An error occurred' });
    } else {
      res.json(results);
    }
  });
});

// Getting a user by ID
app.get('/api/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM persons WHERE id = ?';
  db.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error retrieving person:', error);
      res.status(500).json({ error: 'An error occurred' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Person not found' });
    } else {
      res.json(results[0]);
    }
  });
});

// Creating a user
app.post('/api', validateName, (req, res) => {
  const { name } = req.body;
  const query = 'INSERT INTO persons (name) VALUES (?)';
  db.query(query, [name], (error, results) => {
    if (error) {
      console.error('Error creating person:', error);
      res.status(500).json({ error: 'Error' });
    } else {
      res.status(201).json({ id: results.insertId, name });
    }
  });
});

// Update
app.put('/api/:id', validateName, (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const query = 'UPDATE person SET name = ? WHERE id = ?';
  db.query(query, [name, id], (error, results) => {
    if (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred' });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Person not found' });
    } else {
      res.json({ id, name });
    }
  });
});

// Delete
app.delete('/api/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM persons WHERE id = ?';
  db.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error deleting person:', error);
      res.status(500).json({ error: 'Error' });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Person not found' });
    } else {
      res.json({ message: 'Person deleted successfully' });
    }
  });
});

// Server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
