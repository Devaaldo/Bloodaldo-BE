// controllers/authController.js - Controller untuk autentikasi
const bcrypt = require("bcrypt");
const { pool } = require("../config/db");
const { generateToken } = require("../config/auth");

/**
 * Login untuk admin
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
	try {
		const { username, password } = req.body;

		// Validasi input
		if (!username || !password) {
			return res.status(400).json({
				success: false,
				message: "Username dan password harus diisi",
			});
		}

		// Cari user di database
		const [users] = await pool.query(
			"SELECT * FROM admin_users WHERE username = ?",
			[username]
		);

		if (users.length === 0) {
			return res.status(401).json({
				success: false,
				message: "Username atau password salah",
			});
		}

		const user = users[0];

		// Verifikasi password
		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return res.status(401).json({
				success: false,
				message: "Username atau password salah",
			});
		}

		// Generate token JWT
		const token = generateToken(user.id, user.username);

		// Kirim response
		res.json({
			success: true,
			token,
			user: {
				id: user.id,
				username: user.username,
				fullName: user.fullName,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Verifikasi token
 * @route GET /api/auth/verify
 * @access Private
 */
const verifyUser = async (req, res, next) => {
	try {
		// req.user didapatkan dari middleware authenticateToken
		res.json({
			success: true,
			valid: true,
			user: {
				id: req.user.id,
				username: req.user.username,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Mengubah password admin
 * @route PUT /api/auth/change-password
 * @access Private
 */
const changePassword = async (req, res, next) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const userId = req.user.id;

		// Validasi input
		if (!currentPassword || !newPassword) {
			return res.status(400).json({
				success: false,
				message: "Password lama dan baru harus diisi",
			});
		}

		if (newPassword.length < 6) {
			return res.status(400).json({
				success: false,
				message: "Password baru harus minimal 6 karakter",
			});
		}

		// Cari user di database
		const [users] = await pool.query("SELECT * FROM admin_users WHERE id = ?", [
			userId,
		]);

		if (users.length === 0) {
			return res.status(404).json({
				success: false,
				message: "User tidak ditemukan",
			});
		}

		const user = users[0];

		// Verifikasi password lama
		const isPasswordValid = await bcrypt.compare(
			currentPassword,
			user.password
		);

		if (!isPasswordValid) {
			return res.status(401).json({
				success: false,
				message: "Password lama tidak valid",
			});
		}

		// Hash password baru
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);

		// Update password di database
		await pool.query("UPDATE admin_users SET password = ? WHERE id = ?", [
			hashedPassword,
			userId,
		]);

		res.json({
			success: true,
			message: "Password berhasil diubah",
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	login,
	verifyUser,
	changePassword,
};
