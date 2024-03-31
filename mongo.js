const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017'; // Your MongoDB connection URI

// Create a new MongoClient
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('lynk_to'); // Return the database object
  } catch (err) {
    console.error('Error connecting to MongoDB: ', err);
    throw err;
  }
}

module.exports = connectToMongoDB;
