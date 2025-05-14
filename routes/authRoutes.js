// routes/authRoutes.js - Route untuk autentikasi
const express = require("express");
const router = express.Router();
const {
	login,
	verifyUser,
	changePassword,
} = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// Route untuk login
router.post("/login", login);

// Route untuk verifikasi token
router.get("/verify", authenticateToken, verifyUser);

// Route untuk mengubah password
router.put("/change-password", authenticateToken, changePassword);

module.exports = router;
