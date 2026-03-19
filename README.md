# Project Title

## 1. Introduction
This is a dashboard web application where users can view courses, upload marks, and manage academic data.

---

## 2. Technologies Used

### Frontend
- React.js (v19)
- React Router DOM
- Vite

### Backend
- Node.js
- Express.js

### File Handling & Data Processing
- Multer (for file uploads)
- XLSX (for Excel file processing)

### Middleware & Utilities
- CORS (cross-origin requests)
- Dotenv (environment configuration)

### Styling
- CSS

### Development Tools
- Nodemon
- ESLint
  
---

## 3. Installation (Dependencies)

Install all required dependencies.

### Frontend Dependencies
```bash
npm install
```

### Backend Dependencies
```bash
cd backend
npm install
```

---

## 4. How to Run the Project

### Install Dependencies
```bash
npm install
```

### Run Frontend Server
```bash
npm run dev
```

The frontend will run at:  
http://localhost:5173

### Run Backend Server
```bash
cd backend
npm run dev
```

The backend will run at:  
http://localhost:5000

---

## 5. Website Pages & Usage

### 🔹 Automated Grade Page
- Performs automatic grade calculation based on uploaded marks  
- Applies grading logic and displays final computed grades  

### 🔹 Confirm Weightages Page
- Allows users to define weight distribution (assignments, exams, etc.)  
- Confirms grading criteria before final grade calculation  

### 🔹 Course Details Page
- Displays detailed information about a selected course  
- Shows student data, marks, and course structure  

### 🔹 Dashboard Page
- Acts as the main homepage after login  
- Provides navigation to all major features of the system  

### 🔹 Login Page
- Handles user login and authentication process  
- Restricts access to authorized users only  

### 🔹 Manual Grade Adjustment Page
- Allows manual modification of generated grades  
- Helps instructors fine-tune grading results  

### 🔹 Previous Courses Page
- Displays list of previously created courses  
- Allows users to review past course data  

### 🔹 Statistical Analysis Page
- Provides analysis of student performance data  
- Shows metrics like average, distribution, etc.  

### 🔹 Upload Marks Page
- Allows uploading of student marks (file/manual input)  
- Serves as input source for grading process  

---

## 6. Notes
- Make sure both frontend and backend servers are running simultaneously  
- Ensure backend runs on port 5000 before accessing the frontend  
