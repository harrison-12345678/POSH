const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../Middleware/authMiddleware");
const { getAdminDashboardData } = require("../Controllers/adminDashboardController");

router.get("/", auth, adminAuth, getAdminDashboardData);

module.exports = router;