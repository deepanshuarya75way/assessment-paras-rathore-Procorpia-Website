
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Models
const User = require('./models/User');
const Application = require('./models/Application');
const Contact = require('./models/Contact');

const app = express();
const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("Backend running");
});

// Middleware - Allow file:// origins (null) and localhost for local development
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (null) - this handles file:// protocol
        // Also allow localhost and 127.0.0.1 on any port
        if (!origin || origin === 'null' || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all origins for now (can restrict in production)
        }
    },
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
console.log("MONGO_URI:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => {
    console.error("MongoDB CONNECTION ERROR:", err.message);
  });
  mongoose.connection.on('connected', () => console.log('Mongoose connected to DB'));
mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'resume-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Only PDF, DOC, and DOCX files are allowed!');
        }
    }
});

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, password, company } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists. Please login instead.' });
        }

        user = new User({ fullName, email, password, company });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Create token
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET , { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { fullName: user.fullName, email: user.email } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Job Application Route
app.post('/api/applications', upload.single('resume'), async (req, res) => {
    try {
        const { jobTitle, firstName, lastName, email, phone, location, linkedin, portfolio, experience, noticePeriod, skills, coverLetter } = req.body;

        if (!req.file) {
            return res.status(400).json({ msg: 'Please upload a resume' });
        }

        const newApplication = new Application({
            jobTitle,
            firstName,
            lastName,
            email,
            phone,
            location,
            linkedin,
            portfolio,
            experience,
            noticePeriod,
            skills,
            resumePath: req.file.path,
            coverLetter
        });

        await newApplication.save();
        res.json({ msg: 'Application submitted successfully!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Contact Form Route (Get In Touch)
// Contact Form Route (Get In Touch)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post('/api/contact', async (req, res) => {
    console.log("=== NEW CONTACT FORM SUBMISSION RECEIVED ===");
    console.log("Request Body:", JSON.stringify(req.body, null, 2));   // ← Very important

    try {
        const { name, email, company, phone, service, subject, message } = req.body;

        // Better validation
        if (!email || !message) {
            console.log("VALIDATION FAILED: Email or message missing");
            return res.status(400).json({ 
                success: false, 
                msg: 'Email and message are required.' 
            });
        }

        // Create new document
        const newContact = new Contact({
            name: name || "Anonymous",
            email,
            company: company || "",
            phone: phone || "",
            service: service || "",
            subject: subject || "",
            message
        });

        const savedContact = await newContact.save();

        console.log("SUCCESS: Document saved to MongoDB with ID:", savedContact._id);

        res.json({ 
            success: true,
            msg: 'Your message has been submitted successfully!' 
        });

    } catch (err) {
        console.error("ERROR saving contact:", err.message);
        console.error("Full Error Stack:", err.stack);   // ← This helps a lot in Render logs

        res.status(500).json({ 
            success: false, 
            msg: 'Server error. Please try again later.' 
        });
    }
});
