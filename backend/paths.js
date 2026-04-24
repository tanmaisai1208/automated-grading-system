/**
 * paths.js — Central path resolver for persistent data.
 *
 * When running as a `pkg` binary, __dirname points to a read-only virtual FS
 * inside the executable. We must write data to a directory NEXT TO the binary
 * instead (process.execPath's directory), which is writable.
 *
 * In dev mode (node server.js), process.execPath is the node binary itself,
 * so we fall back to __dirname-relative paths as normal.
 */

const path = require("path");
const fs = require("fs");

// Detect if we're running inside a pkg bundle
const isPkg = typeof process.pkg !== "undefined";

// Base directory for all persistent data
const BASE_DIR = isPkg
  ? path.dirname(process.execPath)      // next to the binary on disk
  : path.join(__dirname);               // project root in dev

const DATA_DIR    = path.join(BASE_DIR, "data");
const UPLOADS_DIR = path.join(BASE_DIR, "uploads");

// Ensure directories exist at startup
[DATA_DIR, UPLOADS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

module.exports = {
  DATA_DIR,
  UPLOADS_DIR,
  COURSES_FILE: path.join(DATA_DIR, "courses.json"),
  USERS_FILE:   path.join(DATA_DIR, "users.json"),
};
