const pool = require("../config/db");
const expertSystem = require("../utils/expertSystem");

// Analyze blood test data and perform detection
exports.analyzeBloodTest = async (req, res) => {
	const { testId } = req.params;

	try {
		console.log(
			`Attempting to analyze blood test ID: ${testId} for user ID: ${req.user.id}`
		);

		// Get blood test data
		const [tests] = await pool.query(
			"SELECT * FROM blood_tests WHERE id = ? AND user_id = ?",
			[testId, req.user.id]
		);

		if (tests.length === 0) {
			console.log("Blood test not found or not authorized");
			return res
				.status(404)
				.json({ message: "Blood test not found or not authorized" });
		}

		const bloodTest = tests[0];
		console.log("Retrieved blood test:", JSON.stringify(bloodTest, null, 2));

		// Run the expert system detection
		console.log("Starting expert system analysis...");
		const startTime = new Date();
		const detectionResult = expertSystem.analyzeBloodTest(bloodTest);
		const endTime = new Date();

		// Calculate analysis time
		const analysisTime = `${((endTime - startTime) / 1000).toFixed(2)} detik`;
		detectionResult.analysisTime = analysisTime;

		console.log("Analysis completed in:", analysisTime);
		console.log(
			"Result:",
			JSON.stringify(detectionResult, null, 2).substring(0, 200) + "..."
		);

		res.json({
			message: "Blood test analyzed successfully",
			bloodTest: {
				id: bloodTest.id,
				patientName: bloodTest.patient_name,
				patientAge: bloodTest.patient_age,
				patientGender: bloodTest.patient_gender,
				testDate: bloodTest.test_date,
			},
			detectionResult,
		});
	} catch (err) {
		console.error("Error analyzing blood test:", err);
		res.status(500).json({
			message: "Server error during blood test analysis",
			error: process.env.NODE_ENV === "development" ? err.message : undefined,
		});
	}
};

// Get detection results for a blood test
exports.getResultsByTestId = async (req, res) => {
	const { testId } = req.params;

	try {
		console.log(`Getting detection results for blood test ID: ${testId}`);

		// Check if blood test exists and belongs to user
		const [tests] = await pool.query(
			"SELECT * FROM blood_tests WHERE id = ? AND user_id = ?",
			[testId, req.user.id]
		);

		if (tests.length === 0) {
			return res
				.status(404)
				.json({ message: "Blood test not found or not authorized" });
		}

		// Get detection results
		const [results] = await pool.query(
			"SELECT * FROM detection_results WHERE blood_test_id = ?",
			[testId]
		);

		if (results.length === 0) {
			console.log("No detection results found for this blood test");
			return res
				.status(404)
				.json({ message: "No detection results found for this blood test" });
		}

		// Parse JSON fields safely
		const result = results[0];
		try {
			result.abnormal_parameters = result.abnormal_parameters
				? JSON.parse(result.abnormal_parameters)
				: {};
			result.possible_conditions = result.possible_conditions
				? JSON.parse(result.possible_conditions)
				: [];
		} catch (jsonError) {
			console.error("Error parsing JSON fields:", jsonError);
			result.abnormal_parameters = {};
			result.possible_conditions = [];
		}

		res.json({ result });
	} catch (err) {
		console.error("Error getting detection results:", err);
		res
			.status(500)
			.json({ message: "Server error while fetching detection results" });
	}
};

// Get all detection results for current user
exports.getAllResultsForUser = async (req, res) => {
	try {
		console.log(`Getting all detection results for user ID: ${req.user.id}`);

		const [rows] = await pool.query(
			`SELECT dr.*, bt.patient_name, bt.test_date 
       FROM detection_results dr
       JOIN blood_tests bt ON dr.blood_test_id = bt.id
       WHERE bt.user_id = ?
       ORDER BY dr.detection_date DESC`,
			[req.user.id]
		);

		// Parse JSON fields for each result safely
		const results = rows.map((row) => {
			try {
				return {
					...row,
					abnormal_parameters: row.abnormal_parameters
						? JSON.parse(row.abnormal_parameters)
						: {},
					possible_conditions: row.possible_conditions
						? JSON.parse(row.possible_conditions)
						: [],
				};
			} catch (jsonError) {
				console.error("Error parsing JSON for result ID:", row.id, jsonError);
				return {
					...row,
					abnormal_parameters: {},
					possible_conditions: [],
				};
			}
		});

		res.json({ results });
	} catch (err) {
		console.error("Error getting all detection results:", err);
		res
			.status(500)
			.json({ message: "Server error while fetching detection results" });
	}
};

// Save detection results
exports.saveResults = async (req, res) => {
	const { bloodTestId, abnormalParameters, possibleConditions, analysisTime } =
		req.body;

	try {
		console.log(`Saving detection results for blood test ID: ${bloodTestId}`);

		// Check if blood test exists and belongs to user
		const [tests] = await pool.query(
			"SELECT * FROM blood_tests WHERE id = ? AND user_id = ?",
			[bloodTestId, req.user.id]
		);

		if (tests.length === 0) {
			return res
				.status(404)
				.json({ message: "Blood test not found or not authorized" });
		}

		// Validate and stringify JSON data
		let abnormalParamsJSON, possibleConditionsJSON;

		try {
			abnormalParamsJSON = JSON.stringify(abnormalParameters || {});
			possibleConditionsJSON = JSON.stringify(possibleConditions || []);
		} catch (jsonError) {
			console.error("Error stringifying JSON data:", jsonError);
			return res.status(400).json({ message: "Invalid JSON data in request" });
		}

		// Check if results already exist for this test
		const [existingResults] = await pool.query(
			"SELECT * FROM detection_results WHERE blood_test_id = ?",
			[bloodTestId]
		);

		if (existingResults.length > 0) {
			// Update existing results
			console.log("Updating existing detection results");
			await pool.query(
				`UPDATE detection_results SET
          abnormal_parameters = ?,
          possible_conditions = ?,
          analysis_time = ?,
          detection_date = CURRENT_TIMESTAMP
        WHERE blood_test_id = ?`,
				[abnormalParamsJSON, possibleConditionsJSON, analysisTime, bloodTestId]
			);

			res.json({
				message: "Detection results updated successfully",
				resultId: existingResults[0].id,
			});
		} else {
			// Insert new results
			console.log("Inserting new detection results");
			const [result] = await pool.query(
				`INSERT INTO detection_results (
          blood_test_id,
          abnormal_parameters,
          possible_conditions,
          analysis_time
        ) VALUES (?, ?, ?, ?)`,
				[bloodTestId, abnormalParamsJSON, possibleConditionsJSON, analysisTime]
			);

			res.status(201).json({
				message: "Detection results saved successfully",
				resultId: result.insertId,
			});
		}
	} catch (err) {
		console.error("Error saving detection results:", err);
		res
			.status(500)
			.json({ message: "Server error while saving detection results" });
	}
};

// For testing purposes: simple test endpoint
exports.testExpertSystem = (req, res) => {
	try {
		console.log("Testing expert system with sample data");

		const testData = {
			id: 999,
			patient_name: "Test Patient",
			patient_age: 35,
			patient_gender: "male",
			hemoglobin: 14.5,
			hematocrit: 45,
			erythrocytes: 5.2,
			leukocytes: 7500,
			thrombocytes: 250000,
			mcv: 88,
			mch: 29,
			mchc: 33,
		};

		const result = expertSystem.analyzeBloodTest(testData);

		res.json({
			message: "Expert system test successful",
			sampleData: testData,
			result,
		});
	} catch (error) {
		console.error("Expert system test failed:", error);
		res.status(500).json({
			message: "Expert system test failed",
			error: error.message,
			stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
		});
	}
};
