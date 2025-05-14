const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/auth");
const pool = require("../config/db");

const authMiddleware = async (req, res, next) => {
	try {
		// Get token from header
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res
				.status(401)
				.json({ message: "No authentication token, authorization denied" });
		}

		const token = authHeader.split(" ")[1];

		// Verify token
		const decoded = jwt.verify(token, JWT_SECRET);

		// Check if user exists
		const [rows] = await pool.query(
			"SELECT id, name, email, role FROM users WHERE id = ?",
			[decoded.id]
		);

		if (rows.length === 0) {
			return res.status(401).json({ message: "Token is not valid" });
		}

		// Add user to request object
		req.user = rows[0];
		next();
	} catch (err) {
		console.error("Auth middleware error:", err.message);
		res.status(401).json({ message: "Token is not valid" });
	}
};

module.exports = authMiddleware;
