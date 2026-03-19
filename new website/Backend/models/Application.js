const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    jobTitle: {
        type: String,
        required: true,
        trim: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    linkedin: String,
    portfolio: String,
    experience: {
        type: String,
        required: true
    },
    noticePeriod: {
        type: String,
        required: true
    },
    skills: {
        type: String,
        required: true
    },
    resumePath: {
        type: String,
        required: true
    },
    coverLetter: String,
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Application', applicationSchema);
