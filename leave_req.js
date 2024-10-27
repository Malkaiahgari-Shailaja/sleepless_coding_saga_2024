/*const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 6420;                                                   [ unneccessary file ]

app.use(bodyParser.json());
app.use(cors());

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12908035@Sr',
  database: 'campus_data'
});

// Connect to the database
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

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
*/