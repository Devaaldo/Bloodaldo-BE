const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/auth");

// Register a new user
exports.register = async (req, res) => {
	const { name, email, password } = req.body;

	try {
		// Check if email already exists
		const [existingUsers] = await pool.query(
			"SELECT * FROM users WHERE email = ?",
			[email]
		);

		if (existingUsers.length > 0) {
			return res.status(400).json({ message: "Email already in use" });
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Insert new user
		const [result] = await pool.query(
			"INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
			[name, email, hashedPassword]
		);

		// Get the created user (without password)
		const [users] = await pool.query(
			"SELECT id, name, email, role FROM users WHERE id = ?",
			[result.insertId]
		);

		const user = users[0];

		// Create JWT token
		const token = jwt.sign({ id: user.id }, JWT_SECRET, {
			expiresIn: JWT_EXPIRES_IN,
		});

		res.status(201).json({
			message: "User registered successfully",
			user,
			token,
		});
	} catch (err) {
		console.error("Registration error:", err);
		res.status(500).json({ message: "Server error during registration" });
	}
};

// Login user
exports.login = async (req, res) => {
	const { email, password } = req.body;

	try {
		// Check if user exists
		const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
			email,
		]);

		if (users.length === 0) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		const user = users[0];

		// Verify password
		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		// Create JWT token
		const token = jwt.sign({ id: user.id }, JWT_SECRET, {
			expiresIn: JWT_EXPIRES_IN,
		});

		// Return user without password
		const { password: _, ...userWithoutPassword } = user;

		res.json({
			message: "Login successful",
			user: userWithoutPassword,
			token,
		});
	} catch (err) {
		console.error("Login error:", err);
		res.status(500).json({ message: "Server error during login" });
	}
};

// Get current user
exports.getCurrentUser = async (req, res) => {
	res.json({ user: req.user });
};
