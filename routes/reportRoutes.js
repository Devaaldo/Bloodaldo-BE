const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Generate and download report for a specific blood test
router.get("/blood-test/:id", reportController.generateBloodTestReport);

// Generate and download report for a specific detection result
router.get("/detection/:id", reportController.generateDetectionReport);

// Generate and download user history report
router.get("/history", reportController.generateHistoryReport);

module.exports = router;
