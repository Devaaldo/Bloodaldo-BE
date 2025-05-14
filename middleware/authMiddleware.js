// middlewares/authMiddleware.js - Middleware untuk autentikasi
const { verifyToken } = require("../config/auth");

// Middleware untuk verifikasi token JWT
const authenticateToken = (req, res, next) => {
	try {
		// Ambil header authorization
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			return res.status(401).json({
				success: false,
				message: "Akses ditolak. Token tidak ditemukan.",
			});
		}

		// Format header: "Bearer [token]"
		const token = authHeader.split(" ")[1];

		if (!token) {
			return res.status(401).json({
				success: false,
				message: "Akses ditolak. Format token tidak valid.",
			});
		}

		// Verifikasi token
		const decoded = verifyToken(token);
		req.user = decoded;

		next();
	} catch (error) {
		return res.status(403).json({
			success: false,
			message: "Token tidak valid atau sudah kedaluwarsa.",
		});
	}
};

// Middleware untuk membatasi akses hanya untuk admin
const adminOnly = (req, res, next) => {
	if (!req.user || !req.user.id) {
		return res.status(403).json({
			success: false,
			message: "Akses ditolak. Anda harus login sebagai admin.",
		});
	}

	// Di sini bisa ditambahkan logika untuk memeriksa apakah user memiliki role admin
	// Untuk sekarang, semua user yang terautentikasi dianggap sebagai admin

	next();
};

module.exports = {
	authenticateToken,
	adminOnly,
};
