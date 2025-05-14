const pool = require("../config/db");
const fs = require("fs");
const path = require("path");
const generateReport = require("../utils/generateReport");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

// Generate and download report for a specific blood test
exports.generateBloodTestReport = async (req, res) => {
	const { id } = req.params;

	try {
		// Check if blood test exists and belongs to user
		const [tests] = await pool.query(
			"SELECT * FROM blood_tests WHERE id = ? AND user_id = ?",
			[id, req.user.id]
		);

		if (tests.length === 0) {
			return res
				.status(404)
				.json({ message: "Blood test not found or not authorized" });
		}

		const bloodTest = tests[0];

		// Generate the report (a simple CSV in this example)
		const reportFileName = `blood_test_${id}_${Date.now()}.csv`;
		const reportPath = path.join(uploadsDir, reportFileName);

		// Format blood test data for report
		const reportData = {
			title: "Blood Test Report",
			patientName: bloodTest.patient_name,
			patientAge: bloodTest.patient_age,
			patientGender:
				bloodTest.patient_gender === "male" ? "Laki-laki" : "Perempuan",
			testDate: new Date(bloodTest.test_date).toLocaleDateString("id-ID"),
			parameters: {
				hemoglobin: bloodTest.hemoglobin,
				hematocrit: bloodTest.hematocrit,
				erythrocytes: bloodTest.erythrocytes,
				leukocytes: bloodTest.leukocytes,
				thrombocytes: bloodTest.thrombocytes,
				mcv: bloodTest.mcv,
				mch: bloodTest.mch,
				mchc: bloodTest.mchc,
			},
			notes: bloodTest.notes,
		};

		// Generate CSV report
		await generateReport.generateCsvReport(reportData, reportPath);

		// Send file to client
		res.download(reportPath, reportFileName, (err) => {
			if (err) {
				console.error("Error downloading file:", err);
				return res.status(500).json({ message: "Error downloading report" });
			}

			// Delete file after download
			fs.unlinkSync(reportPath);
		});
	} catch (err) {
		console.error("Error generating blood test report:", err);
		res.status(500).json({ message: "Server error while generating report" });
	}
};

// Generate and download report for a specific detection result
exports.generateDetectionReport = async (req, res) => {
	const { id } = req.params;

	try {
		// Get detection result and ensure it belongs to user
		const [results] = await pool.query(
			`SELECT dr.*, bt.patient_name, bt.patient_age, bt.patient_gender, bt.test_date 
       FROM detection_results dr
       JOIN blood_tests bt ON dr.blood_test_id = bt.id
       WHERE dr.id = ? AND bt.user_id = ?`,
			[id, req.user.id]
		);

		if (results.length === 0) {
			return res
				.status(404)
				.json({ message: "Detection result not found or not authorized" });
		}

		const detectionResult = results[0];

		// Parse JSON fields
		detectionResult.abnormalParameters = JSON.parse(
			detectionResult.abnormal_parameters
		);
		detectionResult.possibleConditions = JSON.parse(
			detectionResult.possible_conditions
		);

		// Generate the report
		const reportFileName = `detection_report_${id}_${Date.now()}.csv`;
		const reportPath = path.join(uploadsDir, reportFileName);

		// Format detection result data for report
		const reportData = {
			title: "Disease Detection Report",
			patientName: detectionResult.patient_name,
			patientAge: detectionResult.patient_age,
			patientGender:
				detectionResult.patient_gender === "male" ? "Laki-laki" : "Perempuan",
			testDate: new Date(detectionResult.test_date).toLocaleDateString("id-ID"),
			detectionDate: new Date(
				detectionResult.detection_date
			).toLocaleDateString("id-ID"),
			abnormalParameters: detectionResult.abnormalParameters,
			possibleConditions: detectionResult.possibleConditions,
			analysisTime: detectionResult.analysis_time,
		};

		// Generate CSV report
		await generateReport.generateDetectionCsvReport(reportData, reportPath);

		// Send file to client
		res.download(reportPath, reportFileName, (err) => {
			if (err) {
				console.error("Error downloading file:", err);
				return res.status(500).json({ message: "Error downloading report" });
			}

			// Delete file after download
			fs.unlinkSync(reportPath);
		});
	} catch (err) {
		console.error("Error generating detection report:", err);
		res.status(500).json({ message: "Server error while generating report" });
	}
};

// Generate and download user history report
exports.generateHistoryReport = async (req, res) => {
	try {
		// Get all blood tests for the user
		const [bloodTests] = await pool.query(
			"SELECT * FROM blood_tests WHERE user_id = ? ORDER BY test_date DESC",
			[req.user.id]
		);

		if (bloodTests.length === 0) {
			return res.status(404).json({ message: "No blood tests found" });
		}

		// Generate the report
		const reportFileName = `blood_test_history_${Date.now()}.csv`;
		const reportPath = path.join(uploadsDir, reportFileName);

		// Generate CSV report
		await generateReport.generateHistoryCsvReport(bloodTests, reportPath);

		// Send file to client
		res.download(reportPath, reportFileName, (err) => {
			if (err) {
				console.error("Error downloading file:", err);
				return res.status(500).json({ message: "Error downloading report" });
			}

			// Delete file after download
			fs.unlinkSync(reportPath);
		});
	} catch (err) {
		console.error("Error generating history report:", err);
		res.status(500).json({ message: "Server error while generating report" });
	}
};
