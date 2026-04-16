// const express = require("express");
// const session = require("express-session");
// const cors = require("cors");
// const path = require("path");
// const fileUpload = require("express-fileupload"); 

// const authRoutes = require("./routes/authRoutes");
// const courseRoutes = require("./routes/courseRoutes");
// const uploadRoutes = require("./routes/uploadRoutes");
// const gradingRoutes = require("./routes/gradingRoutes");
// const statsRoutes = require("./routes/statsRoutes");

// const app = express();

// /* ✅ DEFINE CORS OPTIONS ONCE */
// const corsOptions = {
//   origin: "http://localhost:5173",
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type"],
// };

// /* ✅ APPLY CORS FIRST */
// app.use(cors(corsOptions));
// // app.options("/*", cors(corsOptions)); // ✅ FIXED

// /* ✅ BODY PARSERS */
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// /* ✅ SESSION */
// app.use(
//   session({
//     secret: "grade-system-secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: false,
//       httpOnly: true,
//       sameSite: "lax",
//       maxAge: 1000 * 60 * 60 * 24,
//     },
//   })
// );

// app.use(fileUpload()); // ✅ enables file upload

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.get("/", (req, res) => {
//   res.json({
//     message: "Automated Grading System Backend is running"
//   });
// });

// app.use("/api/auth", authRoutes);
// app.use("/api/courses", courseRoutes);
// app.use("/api/upload", uploadRoutes); 
// app.use("/api/grading", gradingRoutes);
// app.use("/api/stats", statsRoutes);

// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "Route not found"
//   });
// });

// app.use((err, req, res, next) => {
//   console.error("Server Error:", err);

//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || "Internal Server Error"
//   });
// });

// module.exports = app;

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const gradingRoutes = require("./routes/gradingRoutes");
const statsRoutes = require("./routes/statsRoutes");

const app = express();

/* 🔥 ENV CONFIG */
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const isProduction = process.env.NODE_ENV === "production";

/* 🔥 IMPORTANT for deployment (Render/Proxy) */
app.set("trust proxy", 1);

/* ✅ CORS (dynamic for local + deployed frontend) */
const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));

/* ✅ BODY PARSERS */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ✅ SESSION CONFIG (DEPLOYMENT SAFE) */
app.use(
  session({
    secret: "grade-system-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,        // 🔥 true in production (HTTPS)
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax", // 🔥 IMPORTANT
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

/* ✅ FILE UPLOAD */
app.use(fileUpload());

/* ✅ STATIC FILES */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ✅ HEALTH CHECK */
app.get("/", (req, res) => {
  res.json({
    message: "Automated Grading System Backend is running",
    environment: isProduction ? "production" : "development",
  });
});

/* ✅ ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/grading", gradingRoutes);
app.use("/api/stats", statsRoutes);

/* ❌ 404 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ❌ ERROR HANDLER */
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;