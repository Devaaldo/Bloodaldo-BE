// controllers/analysisController.js - Controller untuk analisis data darah
const { pool } = require("../config/db");
const { analyzeBloodData } = require("../utils/expertSystem");

/**
 * Mendapatkan hasil analisis berdasarkan ID pasien
 * @route GET /api/analysis/:patientId
 * @access Public
 */
const getAnalysisByPatientId = async (req, res, next) => {
	try {
		const { patientId } = req.params;

		// Cari data pasien di database
		const [patients] = await pool.query(
			"SELECT diagnosisData FROM patients WHERE id = ?",
			[patientId]
		);

		if (patients.length === 0) {
			return res.status(404).json({
				success: false,
				message: "Data pasien tidak ditemukan",
			});
		}

		// Parse data diagnosa dari JSON jika perlu
		let diagnosisData;
		try {
			// Periksa apakah diagnosisData adalah string atau sudah berbentuk objek
			const rawData = patients[0].diagnosisData;

			if (typeof rawData === "string") {
				diagnosisData = JSON.parse(rawData);
			} else {
				// Jika sudah berbentuk objek, gunakan langsung
				diagnosisData = rawData;
			}
		} catch (error) {
			console.error("Error parsing diagnosis data:", error);
			return res.status(500).json({
				success: false,
				message: "Format data diagnosa tidak valid",
			});
		}

		res.json({
			success: true,
			data: diagnosisData,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Melakukan analisis data darah tanpa menyimpan ke database
 * @route POST /api/analysis/analyze
 * @access Public
 */
const analyzeBloodDataOnly = async (req, res, next) => {
	try {
		const patientData = req.body;

		// Validasi data pasien
		const requiredFields = [
			"gender",
			"hemoglobin",
			"redBloodCell",
			"whiteBloodCell",
			"platelet",
		];

		for (const field of requiredFields) {
			if (!patientData[field]) {
				return res.status(400).json({
					success: false,
					message: `Field '${field}' harus diisi`,
				});
			}
		}

		// Analisis data darah menggunakan sistem pakar
		const analysisResult = analyzeBloodData(patientData);

		res.json({
			success: true,
			data: analysisResult,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Mendapatkan informasi referensi nilai normal parameter darah
 * @route GET /api/analysis/reference
 * @access Public
 */
const getReferenceValues = async (req, res, next) => {
	try {
		// Definisi nilai normal parameter darah
		const referenceValues = {
			hemoglobin: {
				male: { min: 14, max: 18, unit: "g/dL" },
				female: { min: 12, max: 16, unit: "g/dL" },
			},
			redBloodCell: {
				male: { min: 4.7, max: 6.1, unit: "10^6/µL" },
				female: { min: 4.2, max: 5.4, unit: "10^6/µL" },
			},
			whiteBloodCell: {
				general: { min: 4.5, max: 11.0, unit: "10^3/µL" },
			},
			platelet: {
				general: { min: 150, max: 450, unit: "10^3/µL" },
			},
			hematocrit: {
				male: { min: 41, max: 53, unit: "%" },
				female: { min: 36, max: 46, unit: "%" },
			},
			mcv: {
				general: { min: 80, max: 100, unit: "fL" },
			},
			mch: {
				general: { min: 27, max: 31, unit: "pg" },
			},
			mchc: {
				general: { min: 32, max: 36, unit: "g/dL" },
			},
			neutrophils: {
				general: { min: 40, max: 60, unit: "%" },
			},
			lymphocytes: {
				general: { min: 20, max: 40, unit: "%" },
			},
			monocytes: {
				general: { min: 2, max: 8, unit: "%" },
			},
			eosinophils: {
				general: { min: 1, max: 4, unit: "%" },
			},
			basophils: {
				general: { min: 0, max: 1, unit: "%" },
			},
		};

		res.json({
			success: true,
			data: referenceValues,
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getAnalysisByPatientId,
	analyzeBloodDataOnly,
	getReferenceValues,
};
