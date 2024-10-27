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

// Middleware to check user credentials
app.post('/authentication', (req, res) => {
  const { email, password } = req.body; // Extract email and password from the request body
  
  connection.query(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    [email, password],
    (err, results) => {
      if (err) {
        // Handle the error and send a response
        res.status(500).send('Database error');
      } else if (results.length > 0) {
        // Authentication successful, send the user data or a success message
        res.status(200).json({ message: 'Authentication successful', user: results[0] });
      } else {
        // No user found with the provided credentials
        res.status(401).json({ message: 'Invalid email or password' });
      }
    }
  );
});


// Middleware to check admin credentials
app.post('/admin_authentication', (req, res) => {
  const { email, password } = req.body; // Extract email and password from the request body
  
  connection.query(
    'SELECT * FROM admin WHERE email = ? AND password = ?',
    [email, password],
    (err, results) => {
      if (err) {
        // Handle the error and send a response
        return res.status(500).send('Database error');
      }
      if (results.length > 0) {
        // Authentication successful, send the user data or a success message
        return res.status(200).json({ message: 'Authentication successful', user: results[0] });
      } else {
        // No user found with the provided credentials
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }
  );
});




// Route to add a leave request
app.post('/addLeaveRequest', async (req, res) => {
  const { email, password, dateOfDeparture, dateOfArrival, destination, phoneNumber, parentsPhoneNumber } = req.body;

  try {
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

app.get('/getclassrooms', (req, res) => {
  connection.query('SELECT number, capacity FROM classrooms', (err, results) => {
      if (err) {
          return res.status(500).json({ message: 'Database error', error: err });
      }
      res.status(200).json(results); // Send the results as JSON
  });
});


// Route to add a classroom booking request
app.post('/addClassroomBookingRequest', async (req, res) => {
  const { email, password, classroomNumber, date, timeSlot } = req.body;

  try {
    connection.query(
      'INSERT INTO pending_classroom_requests (classroom_number, date, time_slot, name, rollnumber) VALUES (?, ?, ?, ?, ?)',
      [classroomNumber, date, timeSlot, email , password],
      (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Error adding booking request' });
        }
        res.status(201).json({ message: 'Booking request added', requestId: results.insertId });
      }
    );

  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
});

// Route for admin to approve or reject a classroom booking request
app.post('/updateClassroomBookingRequest', (req, res) => {
  const { rollnumber, status } = req.body; // rollnumber is used instead of requestId, status should be 'approved' or 'rejected'
  const table = status === 'approved' ? 'approved_classroom_requests' : 'rejected_classroom_requests';

  // Move the request to the approved or rejected table
  connection.query(
    'SELECT * FROM pending_classroom_requests WHERE rollnumber = ?',
    [rollnumber],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ message: 'Request not found' });
      }

      const { classroom_number, date, time_slot, name } = results[0];

      connection.query(
        `INSERT INTO ${table} (classroom_number, date, time_slot, name, rollnumber) VALUES (?, ?, ?, ?, ?)`,
        [classroom_number, date, time_slot, name, rollnumber],
        (err) => {
          if (err) {
            return res.status(500).json({ message: 'Error moving request' });
          }

          connection.query(
            'DELETE FROM pending_classroom_requests WHERE rollnumber = ?',
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
function getclassrooms() {
  fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
          const classroomNumber = document.getElementById('classroomSelect');
          classroomNumber.innerHTML = ''; // Clear existing options

          // Create and append options to the select element
          data.forEach(classroom => {
              const option = document.createElement('option');
              option.textContent = classroom.number; // Assuming each classroom object has a 'number' property
              classroomNumber.appendChild(option);
          });

          // Optionally, display the fetched data in a formatted manner
          document.getElementById('output').innerText = JSON.stringify(data, null, 2);
      })
      .catch(error => console.error('Error:', error));
}
//to display pending leave requests
app.get('/get_pending_leave_requests', (req, res) => {
  const query = 'SELECT * from pending_leave_requests'; 
  connection.query(query, (err, results) => {
    console.log(err);
    
      if (err) {
          return res.status(500).json({ message: 'Error fetching data' });
      }
      res.json(results);
  });
});
//to display pending classroom requests
/*app.get('/get_pending_classroom_requests', (req, res) => {
  const query = 'SELECT classroom_number, date, time_slot, name, rollnumber FROM pending_classroom_requests';
  db.query(query, (err, results) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.json(results);
  });
});*/
app.get('/get_pending_classroom_requests', (req, res) => {
  const query = 'SELECT * from pending_classroom_requests'; 
  connection.query(query, (err, results) => {
      if (err) {
          return res.status(500).json({ message: 'Error fetching data' });
      }
      res.json(results);
  });
});
//to display approved leave requests
app.get('/get_approved_leave_requests', (req, res) => {
  const query = 'SELECT * from pending_leave_requests'; 
  connection.query(query, (err, results) => {
      if (err) {
          return res.status(500).json({ message: 'Error fetching data' });
      }
      res.json(results);
  });
});
//to display approved classroom requests
app.get('/get_approved_classroom_requests', (req, res) => {
  const query = 'SELECT classroom_number, date, time_slot, name, rollnumber FROM pending_classroom_requests';
  db.query(query, (err, results) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.json(results);
  });
});
//to display rejected leave requests
app.get('/get_rejected_leave_requests', (req, res) => {
  const query = 'SELECT * pending_leave_requests'; 
  connection.query(query, (err, results) => {
      if (err) {
          return res.status(500).json({ message: 'Error fetching data' });
      }
      res.json(results);
  });
});
//to display rejected classroom requests
app.get('/get_rejected_classroom_requests', (req, res) => {
  const query = 'SELECT classroom_number, date, time_slot, name, rollnumber FROM pending_classroom_requests';
  db.query(query, (err, results) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.json(results);
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
