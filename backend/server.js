
import express from 'express';
import { connectDB } from './db/connection.js';
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());



connectDB();

// Sample route
app.get('/', (req, res) => {
  res.send('Hello World! This is the backend server.');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
