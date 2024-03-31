import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import connection from './db.cjs';
import http from "http"; // Assuming this file contains MySQL connection setup

const app = express();
const port = 3000;
app.use(cors());


app.use(bodyParser.json());

    app.post('/create_user', (req, res) => {
      console.log("in the create user")
      console.log("req.body",req.body)
      const { rollno, username, password } = req.body; // Assuming the request body contains user_id, username, and password
      // Insert the user into the database
      const query = 'INSERT INTO users (user_id, username, password) VALUES (?, ?, ?)';
      connection.query(query, [rollno, username, password], (err, result) => {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).json({ error: 'Error creating user' });
        }
        res.status(201).json({ message: 'User created successfully' });
      });
    });

    app.post('/login', (req, res) => {
      console.log("in the login")
      console.log("req.body",req.body)
      const { rollno, password } = req.body; // Assuming the request body contains user_id and password
      // Check if the user exists in the database
      const query = 'SELECT * FROM users WHERE user_id = ? AND password = ?';
      connection.query(query, [rollno, password], (err, result) => {
        if (err) {
          console.error('Error during login:', err);
          return res.status(500).json({ error: 'Error during login' });
        }
        if (result.length === 0) {
          return res.status(401).json({ error: 'Invalid user_id or password' });
        }
        res.json({ message: 'Login successful' });
      });
    });

    app.get('/messages', (req, res) => {
      console.log("in the messages");
      const query = 'SELECT * FROM messages';
      connection.query(query, (err, result) => {
        if (err) {
          console.error('Error fetching messages:', err);
          return res.status(500).json({ error: 'Error fetching messages' });
        }
        console.log('Messages fetched successfully:', result);
        res.json(result);
      });
    });
    
    

    app.post('/post_message', (req, res) => {
      const { rollno, message, timestamp } = req.body;
  
      if (!rollno || !message || !timestamp) {
          return res.status(422).json({ error: "Please provide rollno, message, and timestamp." });
      }
  
      // Construct the SQL query
      const query = `
          INSERT INTO messages (rollno, message, timestamp)
          VALUES (?, ?, ?);
      `;
  
      // Execute the query
      connection.query(query, [rollno, message, timestamp], (err, result) => {
          if (err) {
              console.error('Error posting message:', err);
              return res.status(500).json({ error: 'Error posting message' });
          }
          console.log('Message has been inserted');
          res.status(201).json({ message: 'Message posted successfully' });
      });
  });

  app.get('/user_info', (req, res) => {
    const { user_id } = req.query; // Extract user_id from req.query

    // Ensure user_id is provided
    if (!user_id) {
        return res.status(400).json({ error: 'user_id parameter is required.' });
    }
    console.log('Received user_id:', user_id);

    const query = 'SELECT * FROM users WHERE user_id = ?';

    connection.query(query, user_id, (err, result) => {
        if (err) {
            console.error('Error fetching details:', err);
            return res.status(500).json({ error: 'Error fetching Details' });
        }
        console.log(result); // Log the result here
        res.json(result[0]);
    });
});


  

    app.get('/events', (req, res) => {
      const { event_date, user_id } = req.query;
    
      if (!event_date || !user_id) {
        return res.status(400).json({ error: 'Both event_date and user_id parameters are required.' });
      }
    
      const query = `
        SELECT s.subject_name, e.event_type, e.event_time
        FROM events e
        JOIN registrations r ON e.subject_code = r.subject_id
        JOIN subjects s ON e.subject_code = s.subject_code
        WHERE r.user_id = ?
        AND e.event_date = ?;`;
    
      connection.query(query, [user_id, event_date], (err, result) => {
        if (err) {
          console.error('Error fetching events:', err);
          return res.status(500).json({ error: 'Error fetching events' });
        }
        res.json(result);
      });
    });

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });


  app.post('/script', async (req, res) => {
    const { message } = req.body;
  
    // Validate the incoming data
    if (!message) {
      return res.status(422).json({ error: 'Please provide a message.' });
    }
  
    // Construct the data to be sent in the POST request
    const postData = JSON.stringify({
      query: message // Modify this with the actual query you want to send
    });
  
    // Define the options for the HTTP POST request
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };
  
    // Create the HTTP request object
    const httpRequest = http.request(options, (httpResponse) => {
      let data = '';
      httpResponse.on('data', (chunk) => {
        data += chunk;
      });
      httpResponse.on('end', () => {
        console.log('Query sent successfully:', data);
        res.status(201).json({ message: 'Message posted successfully' });
      });
    });
  
    // Handle errors
    httpRequest.on('error', (error) => {
      console.error('Error sending query:', error);
      res.status(500).json({ error: 'Error sending query' });
    });
  
    // Write the data to the request body
    httpRequest.write(postData);
    httpRequest.end();
  });
  