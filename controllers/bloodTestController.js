const pool = require("../config/db");

// Get all blood tests for current user
exports.getAllTests = async (req, res) => {
	try {
		const [rows] = await pool.query(
			"SELECT * FROM blood_tests WHERE user_id = ? ORDER BY test_date DESC",
			[req.user.id]
		);

		res.json({ tests: rows });
	} catch (err) {
		console.error("Error getting blood tests:", err);
		res
			.status(500)
			.json({ message: "Server error while fetching blood tests" });
	}
};

// Get a specific blood test
exports.getTestById = async (req, res) => {
	const { id } = req.params;

	try {
		const [rows] = await pool.query(
			"SELECT * FROM blood_tests WHERE id = ? AND user_id = ?",
			[id, req.user.id]
		);

		if (rows.length === 0) {
			return res.status(404).json({ message: "Blood test not found" });
		}

		res.json({ test: rows[0] });
	} catch (err) {
		console.error("Error getting blood test:", err);
		res.status(500).json({ message: "Server error while fetching blood test" });
	}
};

// Create a new blood test
exports.createTest = async (req, res) => {
	const {
		patientName,
		patientAge,
		patientGender,
		hemoglobin,
		hematocrit,
		erythrocytes,
		leukocytes,
		thrombocytes,
		mcv,
		mch,
		mchc,
		notes,
	} = req.body;

	try {
		const [result] = await pool.query(
			`INSERT INTO blood_tests (
        user_id,
        patient_name,
        patient_age,
        patient_gender,
        hemoglobin,
        hematocrit,
        erythrocytes,
        leukocytes,
        thrombocytes,
        mcv,
        mch,
        mchc,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				req.user.id,
				patientName,
				patientAge,
				patientGender,
				hemoglobin,
				hematocrit,
				erythrocytes,
				leukocytes,
				thrombocytes,
				mcv,
				mch,
				mchc,
				notes,
			]
		);

		// Get the created test
		const [tests] = await pool.query("SELECT * FROM blood_tests WHERE id = ?", [
			result.insertId,
		]);

		res.status(201).json({
			message: "Blood test created successfully",
			test: tests[0],
		});
	} catch (err) {
		console.error("Error creating blood test:", err);
		res.status(500).json({ message: "Server error while creating blood test" });
	}
};

// Update a blood test
exports.updateTest = async (req, res) => {
	const { id } = req.params;
	const {
		patientName,
		patientAge,
		patientGender,
		hemoglobin,
		hematocrit,
		erythrocytes,
		leukocytes,
		thrombocytes,
		mcv,
		mch,
		mchc,
		notes,
	} = req.body;

	try {
		// Check if test exists and belongs to user
		const [existingTests] = await pool.query(
			"SELECT * FROM blood_tests WHERE id = ? AND user_id = ?",
			[id, req.user.id]
		);

		if (existingTests.length === 0) {
			return res
				.status(404)
				.json({ message: "Blood test not found or not authorized" });
		}

		// Update the test
		await pool.query(
			`UPDATE blood_tests SET
        patient_name = ?,
        patient_age = ?,
        patient_gender = ?,
        hemoglobin = ?,
        hematocrit = ?,
        erythrocytes = ?,
        leukocytes = ?,
        thrombocytes = ?,
        mcv = ?,
        mch = ?,
        mchc = ?,
        notes = ?
      WHERE id = ?`,
			[
				patientName,
				patientAge,
				patientGender,
				hemoglobin,
				hematocrit,
				erythrocytes,
				leukocytes,
				thrombocytes,
				mcv,
				mch,
				mchc,
				notes,
				id,
			]
		);

		// Get the updated test
		const [updatedTests] = await pool.query(
			"SELECT * FROM blood_tests WHERE id = ?",
			[id]
		);

		res.json({
			message: "Blood test updated successfully",
			test: updatedTests[0],
		});
	} catch (err) {
		console.error("Error updating blood test:", err);
		res.status(500).json({ message: "Server error while updating blood test" });
	}
};

// Delete a blood test
exports.deleteTest = async (req, res) => {
	const { id } = req.params;

	try {
		// Check if test exists and belongs to user
		const [existingTests] = await pool.query(
			"SELECT * FROM blood_tests WHERE id = ? AND user_id = ?",
			[id, req.user.id]
		);

		if (existingTests.length === 0) {
			return res
				.status(404)
				.json({ message: "Blood test not found or not authorized" });
		}

		// Delete the test (cascade will also delete related detection results)
		await pool.query("DELETE FROM blood_tests WHERE id = ?", [id]);

		res.json({ message: "Blood test deleted successfully" });
	} catch (err) {
		console.error("Error deleting blood test:", err);
		res.status(500).json({ message: "Server error while deleting blood test" });
	}
};

// Get recent blood tests for current user
exports.getRecentTests = async (req, res) => {
	try {
		const [rows] = await pool.query(
			"SELECT * FROM blood_tests WHERE user_id = ? ORDER BY test_date DESC LIMIT 5",
			[req.user.id]
		);

		res.json({ tests: rows });
	} catch (err) {
		console.error("Error getting recent blood tests:", err);
		res
			.status(500)
			.json({ message: "Server error while fetching recent blood tests" });
	}
};
