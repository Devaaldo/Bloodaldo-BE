const express = require("express");
const router = express.Router();
const bloodTestController = require("../controllers/bloodTestController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Get all blood tests for current user
router.get("/", bloodTestController.getAllTests);

// Get a specific blood test
router.get("/:id", bloodTestController.getTestById);

// Create a new blood test
router.post("/", bloodTestController.createTest);

// Update a blood test
router.put("/:id", bloodTestController.updateTest);

// Delete a blood test
router.delete("/:id", bloodTestController.deleteTest);

// Get recent blood tests for current user
router.get("/user/recent", bloodTestController.getRecentTests);

module.exports = router;
