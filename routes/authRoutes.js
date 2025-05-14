const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Register a new user
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

// Get current user (requires authentication)
router.get("/me", authMiddleware, authController.getCurrentUser);

module.exports = router;
