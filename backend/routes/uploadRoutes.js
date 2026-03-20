const express = require("express");
const router = express.Router();

const { uploadExcel } = require("../controllers/uploadController");

router.post("/", uploadExcel);

module.exports = router;  