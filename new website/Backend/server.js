require('dotenv').config({ override: true });
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

const app = express();
const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("Backend running");
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB successfully connected to: procorpia_db'))
    .catch(err => {
        console.error('MongoDB CONNECTION ERROR:', err.message);
        console.log('TIP: Make sure your MongoDB service is running in MongoDB Compass.');
    });

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
