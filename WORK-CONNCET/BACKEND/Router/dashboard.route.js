const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../Controller/dashboard.controller");
const { protect } = require("../Middleware/auth.middleware");

// Get dashboard statistics
router.get("/stats", protect, getDashboardStats);

module.exports = router;
