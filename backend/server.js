const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH"]
    }
});

app.use(cors());
app.use(express.json());

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./middleware/authMiddleware');

// Staff Registry (Hardcoded for demo)
const STAFF_USERS = {
    'doc_01': { password: 'pass123', name: 'Dr. Smith', role: 'Doctor' },
    'nurse_01': { password: 'pass123', name: 'Nurse Miller', role: 'Nurse' }
};

// ... In-Memory Data Stores ...
global.beds = new Map();
global.patientQueue = [];
global.patients = [];

// Make io accessible globally
global.io = io;

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const user = STAFF_USERS[username];

    if (user && user.password === password) {
        const token = jwt.sign({
            username,
            name: user.name,
            role: user.role
        }, JWT_SECRET, { expiresIn: '8h' });

        res.json({
            success: true,
            token,
            user: {
                name: user.name,
                role: user.role
            }
        });
    } else {
        res.status(401).json({ error: 'Invalid username or password' });
    }
});

const PORT = process.env.PORT || 5000;

// Initialize System (Mock Data)
const { initializeBeds } = require('./services/bedService');
const { initializePatients } = require('./services/patientService');

initializeBeds();
initializePatients();

// Import Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Hospital Bed Management API is running');
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
