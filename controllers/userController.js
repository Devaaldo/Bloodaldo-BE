const bcrypt = require("bcrypt");
const pool = require("../config/db");

// Update current user profile
exports.updateProfile = async (req, res) => {
	const { name, email } = req.body;

	try {
		// Check if email is already taken by another user
		if (email !== req.user.email) {
			const [existingUsers] = await pool.query(
				"SELECT * FROM users WHERE email = ? AND id != ?",
				[email, req.user.id]
			);

			if (existingUsers.length > 0) {
				return res.status(400).json({ message: "Email already in use" });
			}
		}

		// Update user profile
		await pool.query("UPDATE users SET name = ?, email = ? WHERE id = ?", [
			name,
			email,
			req.user.id,
		]);

		// Get updated user info
		const [users] = await pool.query(
			"SELECT id, name, email, role FROM users WHERE id = ?",
			[req.user.id]
		);

		res.json({
			message: "Profile updated successfully",
			user: users[0],
		});
	} catch (err) {
		console.error("Error updating profile:", err);
		res.status(500).json({ message: "Server error while updating profile" });
	}
};

// Change password
exports.changePassword = async (req, res) => {
	const { currentPassword, newPassword } = req.body;

	try {
		// Get user with password
		const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [
			req.user.id,
		]);

		if (users.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		const user = users[0];

		// Verify current password
		const isMatch = await bcrypt.compare(currentPassword, user.password);

		if (!isMatch) {
			return res.status(400).json({ message: "Current password is incorrect" });
		}

		// Hash new password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);

		// Update password
		await pool.query("UPDATE users SET password = ? WHERE id = ?", [
			hashedPassword,
			req.user.id,
		]);

		res.json({ message: "Password changed successfully" });
	} catch (err) {
		console.error("Error changing password:", err);
		res.status(500).json({ message: "Server error while changing password" });
	}
};

// Admin routes

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
	try {
		const [users] = await pool.query(
			"SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
		);

		res.json({ users });
	} catch (err) {
		console.error("Error getting all users:", err);
		res.status(500).json({ message: "Server error while fetching users" });
	}
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
	const { id } = req.params;
	const { name, email, role } = req.body;

	try {
		// Check if user exists
		const [existingUsers] = await pool.query(
			"SELECT * FROM users WHERE id = ?",
			[id]
		);

		if (existingUsers.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		// Check if email is already taken by another user
		if (email !== existingUsers[0].email) {
			const [emailUsers] = await pool.query(
				"SELECT * FROM users WHERE email = ? AND id != ?",
				[email, id]
			);

			if (emailUsers.length > 0) {
				return res.status(400).json({ message: "Email already in use" });
			}
		}

		// Update user
		await pool.query(
			"UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?",
			[name, email, role, id]
		);

		// Get updated user info
		const [updatedUsers] = await pool.query(
			"SELECT id, name, email, role, created_at FROM users WHERE id = ?",
			[id]
		);

		res.json({
			message: "User updated successfully",
			user: updatedUsers[0],
		});
	} catch (err) {
		console.error("Error updating user:", err);
		res.status(500).json({ message: "Server error while updating user" });
	}
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
	const { id } = req.params;

	try {
		// Check if user exists
		const [existingUsers] = await pool.query(
			"SELECT * FROM users WHERE id = ?",
			[id]
		);

		if (existingUsers.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		// Cannot delete yourself
		if (parseInt(id) === req.user.id) {
			return res
				.status(400)
				.json({ message: "Cannot delete your own account" });
		}

		// Delete user
		await pool.query("DELETE FROM users WHERE id = ?", [id]);

		res.json({ message: "User deleted successfully" });
	} catch (err) {
		console.error("Error deleting user:", err);
		res.status(500).json({ message: "Server error while deleting user" });
	}
};
