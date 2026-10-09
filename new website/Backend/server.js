
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/test', (req, res) => {
    res.json({
        message: "Backend is working on Hostinger!",
        status: "success",
        time: new Date().toISOString()
    });
});
app.get("/", (req, res) => {
    res.send("Backend running");
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

// This line is important for preflight requests

// Middleware - Allow file:// origins (null) and localhost for local development

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

const verifyActiveSession = async (req,res,next) =>{
    const token = req.header('Authorization')?.replace('Bearer','');
    if(!token){
        return res.status(401).json({msg: 'No Token'});
    }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.user.id);

        if(!user || user.activeSessionToken !== token){
            return res.status(401).json({
                msg: 'Session expired you have been logged in other',
                sessionInvalid: true
            });
        }
        req.user = decoded.user;
        next();

    }
    catch(err){
        return res.status(401).json({msg: 'Token is not valid',sessionInvalid: true});
    }
};
app.get('/api/auth/verify-session', verifyActiveSession,(req,res)=>{
    res.json({valid:true});
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
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
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
        const { email, password, deviceName } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        const previousDeviceName = user.activeDeviceName || 'Desktop/ laptop';
        const hadActiveSession = !!user.activeSessionToken;


        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload,process.env.JWT_SECRET || 'secret',{expiresIn: 3600});

        user.activeSessionToken = token;
        user.activeDeviceName = deviceName || 'laptop/ Desktop';
        user.lastLoginAt = new Date();
        await user.save();
        res.json({
            token,
            user: {fullName: user.fullName,email: user.email},
            sessionTokeover: hadActiveSession ?{
                previousDevice: previousDeviceName
            } : null
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

// Contact Form Route - Replace your old one with this
app.post('/api/contact', async (req, res) => {
    console.log("=== CONTACT FORM SUBMITTED ===");
    console.log("Full Request Body Received:", JSON.stringify(req.body, null, 2));

    try {
        const { name, email, company, phone, service, subject, message } = req.body;

        // Validation
        if (!email || !message) {
            console.log("❌ VALIDATION FAILED: Email or message is missing");
            return res.status(400).json({
                success: false,
                msg: 'Email and message are required.'
            });
        }

        console.log("✅ Validation passed. Creating document...");

        const newContact = new Contact({
            name: name || "Anonymous",
            email: email,
            company: company || "",
            phone: phone || "",

            service: service || "",
            subject: subject || "",
            message: message
        });

        const savedContact = await newContact.save();

        console.log("✅ SUCCESS: Message saved in MongoDB! ID =", savedContact._id);

        // Send success response
        res.json({
            success: true,
            msg: 'Your message has been submitted successfully!'
        });

    } catch (err) {
        console.error("❌ ERROR in /api/contact route:");
        console.error("Error Message:", err.message);
        console.error("Full Error:", err);

        res.status(500).json({
            success: false,
            msg: 'Server error. Please try again later.'
        });
    }
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
});