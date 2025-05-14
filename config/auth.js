// config/auth.js - Konfigurasi autentikasi dan JWT
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// Secret key untuk JWT (gunakan variabel lingkungan untuk keamanan)
const JWT_SECRET = process.env.JWT_SECRET || "bloodaldo_secret_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// Fungsi untuk membuat token JWT
const generateToken = (userId, username) => {
	return jwt.sign({ id: userId, username }, JWT_SECRET, {
		expiresIn: JWT_EXPIRES_IN,
	});
};

// Fungsi untuk memverifikasi token JWT
const verifyToken = (token) => {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (error) {
		throw new Error("Invalid or expired token");
	}
};

module.exports = {
	JWT_SECRET,
	generateToken,
	verifyToken,
};
