const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Define Routes
app.get('/', (req, res) => {
    res.json({ message: 'List of blogs' });
});

// Define Routes
app.get('/message', (req, res) => {
    res.json({ message: 'This is the message' });
});

// Define Routes
app.post('/submit', (req, res) => {
    const data = req.body;
    console.log("Received data from React:", data);

    res.json({ message: 'Data received successfully!', receivedData: data });
});


// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});