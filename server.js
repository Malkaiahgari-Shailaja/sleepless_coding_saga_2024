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

/*
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
});*/


// Middleware to check user credentials
async function checkUserCredentials(email, password) {
  return new Promise((resolve, reject) => {
    connection.query(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      }
    );
  });
}

// Route to add a leave request
app.post('/addLeaveRequest', async (req, res) => {
  const { email, password, dateOfDeparture, dateOfArrival, destination, phoneNumber, parentsPhoneNumber } = req.body;

  try {
    const user = await checkUserCredentials(email, password);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, rollnumber } = user;

    connection.query(
      'INSERT INTO pending_leave_requests (date_of_departure, date_of_arrival, destination, phone_number, parents_phone_number, name, rollnumber) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [dateOfDeparture, dateOfArrival, destination, phoneNumber, parentsPhoneNumber, name, rollnumber],
      (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Error adding leave request' });
        }
        res.status(201).json({ message: 'Leave request added', requestId: results.insertId });
      }
    );

  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
});

// Route for admin to approve or reject a request
app.post('/updateLeaveRequest', (req, res) => {
  const { rollnumber, status } = req.body; // rollnumber is used instead of requestId, status should be 'approved' or 'rejected'
  const table = status === 'approved' ? 'approved_requests' : 'rejected_requests';

  // Move the request to the approved or rejected table
  connection.query(
    'SELECT * FROM pending_leave_requests WHERE rollnumber = ?',
    [rollnumber],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ message: 'Request not found' });
      }

      const { date_of_departure, date_of_arrival, destination, phone_number, parents_phone_number, name } = results[0];

      connection.query(
        `INSERT INTO ${table} (date_of_departure, date_of_arrival, destination, phone_number, parents_phone_number, name, rollnumber) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [date_of_departure, date_of_arrival, destination, phone_number, parents_phone_number, name, rollnumber],
        (err) => {
          if (err) {
            return res.status(500).json({ message: 'Error moving request' });
          }

          connection.query(
            'DELETE FROM pending_leave_requests WHERE rollnumber = ?',
            [rollnumber],
            (err) => {
              if (err) {
                return res.status(500).json({ message: 'Error deleting pending request' });
              }
              res.status(200).json({ message: `Request ${status}` });
            }
          );
        }
      );
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
