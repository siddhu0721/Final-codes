const express = require('express');
const sequelize = require('./config/db'); // Points to your database connection
const Student = require('./models/Student');
const Menu = require('./models/Menu');
const Transaction = require('./models/Transaction');
const Feedback = require('./models/Feedback');
const MessManager = require('./models/MessManager');

const app = express();
const PORT = 3000; // Keeping the repo's original port

app.use(express.json()); // Allows the server to read JSON data

// 1. Test Route (Keep this)
//app.get('/', (req, res) => {
  //res.send('Mess Automation Backend is Running and Connected!');
//});

// 2. Database Connection and Sync
// This creates the tables in your PostgreSQL (Port 5432)
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully on port 5432');
    // Start the server only after the DB is ready
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to sync database:', err);
  });