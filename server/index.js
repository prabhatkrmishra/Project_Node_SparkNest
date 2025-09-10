import express from "express";
import cors from "cors";
import env from "dotenv";

const hostname = "0.0.0.0";
const port = 5000;

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
env.config();

// Define Routes
app.get('/', (req, res) => {
    res.json({ message: 'List of blogs' });
});

// Define Routes
app.get('/message', (req, res) => {
    res.json({ message: 'This is the message' });
});

// Login Routes
app.post('/login', (req, res) => {
    const userCred = req.body;
    console.log("Received data from Login:", userCred);

    res.json({ message: 'Data received successfully!', receivedData: userCred });
});

// Signup Routes
app.post('/signup', (req, res) => {
    const userCred = req.body;
    console.log("Received data from Signup:", userCred);

    res.status(200).json({ message: 'Data received successfully!', receivedData: userCred });
});

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});