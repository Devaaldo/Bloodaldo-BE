const express = require("express");
const router = express.Router();
const detectionController = require("../controllers/detectionController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Perform detection based on blood test
router.post("/analyze/:testId", detectionController.analyzeBloodTest);

// Get detection results for a blood test
router.get("/results/:testId", detectionController.getResultsByTestId);

// Get all detection results for current user
router.get("/results", detectionController.getAllResultsForUser);

// Save detection results
router.post("/results", detectionController.saveResults);

module.exports = router;
