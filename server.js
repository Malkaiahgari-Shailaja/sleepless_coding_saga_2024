const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 6969;

app.use(bodyParser.json());
app.use(cors());

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12908035@Sr',
  database:'campus_data'
});

// Connect to the database
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// API to get all students data
app.get('/api/students', (req, res) => {
  const query = 'SELECT * FROM students';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Server Error');
      return;
    }
    res.json(results);
  });
});

// API to filter students by marks
app.get('/api/students/filter', (req, res) => {
  const { minMarks, maxMarks } = req.query;
  const query = 'SELECT * FROM students WHERE marks BETWEEN ? AND ?';
  connection.query(query, [minMarks, maxMarks], (err, results) => {
    if (err) {
      console.error('Error filtering data:', err);
      res.status(500).send('Server Error');
      return;
    }
    res.json(results);
  });
});

// API to sort students by marks
app.get('/api/students/sort', (req, res) => {
  const { order } = req.query; // 'ASC' or 'DESC'
  const query = `SELECT * FROM students ORDER BY marks ${order}`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error sorting data:', err);
      res.status(500).send('Server Error');
      return;
    }
    res.json(results);
  });
});

// API to search for a student by name
app.get('/api/students/search', (req, res) => {
  const { name } = req.query;
  const query = 'SELECT * FROM students WHERE name LIKE ?';
  connection.query(query, [`%${name}%`], (err, results) => {
    if (err) {
      console.error('Error searching data:', err);
      res.status(500).send('Server Error');
      return;
    }
    res.json(results);
  });
});

// API to add a new student
app.post('/api/students', (req, res) => {
  const { name, roll_number, branch, marks } = req.body;
  const query = 'INSERT INTO students (name, roll_number, branch, marks) VALUES (?, ?, ?, ?)';
  connection.query(query, [name, roll_number, branch, marks], (err, results) => {
    if (err) {
      console.error('Error adding student:', err);
      res.status(500).send('Server Error');
      return;
    }
    res.json({ message: 'Student added successfully', studentId: results.insertId });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
