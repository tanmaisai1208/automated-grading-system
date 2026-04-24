const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");
const { UPLOADS_DIR } = require("./paths");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const gradingRoutes = require("./routes/gradingRoutes");
const statsRoutes = require("./routes/statsRoutes");

const app = express();

/* ✅ DEFINE CORS OPTIONS ONCE */
const corsOptions = {
  // In production (pkg binary), frontend is served by Express on same origin.
  // In dev, Vite runs on 5173.
  origin: process.env.NODE_ENV === "production"
    ? false                          // same-origin, no CORS needed
    : "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
};

/* ✅ APPLY CORS FIRST */
app.use(cors(corsOptions));
// app.options("/*", cors(corsOptions)); // ✅ FIXED

/* ✅ BODY PARSERS */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ✅ SESSION */
app.use(
  session({
    secret: "grade-system-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(fileUpload()); // ✅ enables file upload

app.use("/uploads", express.static(UPLOADS_DIR));

/* ✅ API ROUTES — must come before static/catch-all */
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/grading", gradingRoutes);
app.use("/api/stats", statsRoutes);

/* Serve built React frontend (present after npm run build) */
const frontendPath = path.join(__dirname, "public");
if (require("fs").existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  // Catch-all: let React Router handle client-side routes
  app.get("/{*path}", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
} else {
  // Dev fallback: plain 404 for unknown routes
  app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });
}

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

module.exports = app;