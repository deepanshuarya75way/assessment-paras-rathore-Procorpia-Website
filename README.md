# Procorpia — Enterprise Operations & Strategy Platform

A full-stack enterprise web application designed for **Procorpia**, delivering business consulting, strategy services, user authentication, a career portal with resume processing, and automated client inquiries.

---

## 🚀 Live Demo & Repository
- **Repository:** [https://github.com/paras-arch/Procorpia-Website](https://github.com/paras-arch/Procorpia-Website)
- **Live Website:** [https://procorpia-website.vercel.app/#home](https://procorpia-website.vercel.app/#home)
- **Live Backend API:** [https://procorpia-backend.onrender.com](https://procorpia-backend.onrender.com)

---

## 🛠️ Tech Stack

### Frontend
- **HTML5 & CSS3:** Semantic structure, custom responsive design system, modern micro-interactions, CSS Grid & Flexbox.
- **JavaScript (Vanilla ES6+):** Dynamic client-side logic, asynchronous API handling (`fetch`), responsive navigation.
- **Icons & Typography:** FontAwesome 6, Google Fonts (`Inter`).

### Backend
- **Runtime & Framework:** Node.js, Express.js.
- **Database:** MongoDB Atlas with Mongoose ODM.
- **Authentication & Security:** JSON Web Tokens (JWT), Bcrypt.js password hashing, CORS configuration.
- **File Processing:** Multer (secure handling and validation of applicant resumes in PDF/DOC/DOCX format).
- **Environment Management:** Dotenv.

---

## 📂 Project Structure

```text
Procorpia-Website/
├── .gitignore                      # Git ignore rules for security and dependencies
├── README.md                       # Project documentation
└── new website/
    ├── Frontend/                   # Client-side web application
    │   ├── index.html              # Home page with services, insights & contact form
    │   ├── Careers.html            # Career opportunities & open positions
    │   ├── ApplicationForm.html    # Job application form with resume file upload
    │   ├── Login.html              # User authentication portal
    │   ├── SignUp.html             # User registration portal
    │   ├── Requirements.html       # Business and project specifications
    │   ├── TermsAndPrivacy.html    # Legal & privacy policies
    │   ├── design.css              # Main responsive styling & design system
    │   ├── script.js               # Global UI scripts & event handlers
    │   └── Images/                 # Image assets and media
    │
    └── Backend/                    # Server-side REST API
        ├── models/                 # Mongoose database schemas
        │   ├── User.js             # User account schema (Auth)
        │   ├── Application.js      # Job candidate application schema
        │   └── Contact.js          # Client inquiry / contact form schema
        ├── uploads/                # Local storage for uploaded candidate resumes
        ├── .env.example            # Environment variables template
        ├── server.js               # Express application entry point & API routes
        └── package.json            # Node.js dependencies and run scripts
```

---

## ⚡ Features

1. **Enterprise Landing Page:**
   - Interactive hero showcase, strategic consulting service details, and industry insights.
   - Fully responsive on desktop, tablet, and mobile devices.

2. **Client Inquiry & Contact System:**
   - Inquiries submitted through the contact form are validated and securely stored in MongoDB.

3. **Careers & Job Application Portal:**
   - Interactive job listings across strategy, operations, and technology.
   - Multipart form handling for applicant details and resume uploads (`.pdf`, `.doc`, `.docx`).

4. **Authentication & Authorization:**
   - Secure account registration with hashed passwords (`bcryptjs`).
   - Token-based login sessions (`jsonwebtoken`).

---

## 💻 Local Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or higher)
- [Git](https://git-scm.com/)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (or a local MongoDB instance)

---

### 1. Clone the Repository
```bash
git clone https://github.com/paras-arch/Procorpia-Website.git
cd Procorpia-Website
```

---

### 2. Configure Backend Environment

1. Navigate to the backend directory:
   ```bash
   cd "new website/Backend"
   ```
2. Create your `.env` file from the example template:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in your configuration:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string_here
   JWT_SECRET=your_jwt_secret_key_here
   ```

---

### 3. Install Dependencies & Start the Backend

```bash
npm install
npm start
```
The backend server will start at: `http://localhost:5000` (or the configured `PORT`).

---

### 4. Run the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd "../Frontend"
   ```
2. Open `index.html` in your browser, or use VS Code's **Live Server** extension:
   - Right-click `index.html` → **"Open with Live Server"**.
   - Accessible at `http://127.0.0.1:5500/index.html`.

---

## 🔒 Security Best Practices Implemented

- Sensitive environment variables (`.env`) and database credentials are excluded from version control.
- Candidate resumes and uploaded files are kept private and ignored by Git.
- Passwords are salted and securely hashed using `bcryptjs` before storage.
- File uploads are validated with strict MIME-type and extension filtering.

---

## 📄 License
This project is proprietary and developed for **Procorpia**. All rights reserved.
