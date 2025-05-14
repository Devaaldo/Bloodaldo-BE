// controllers/patientController.js - Perbaikan fungsi prepareDiagnosisData
const { pool } = require("../config/db");
const { analyzeBloodData } = require("../utils/expertSystem");

/**
 * Fungsi untuk menyimpan diagnosisData dengan benar
 * @param {Object} analysisResult - Hasil analisis data darah
 * @returns {string|Object} - Data JSON yang siap disimpan ke database
 */
const prepareDiagnosisData = (analysisResult) => {
	// MySQL versi terbaru menerima objek JSON langsung, tapi kita akan ubah ke string
	// untuk keamanan dan konsistensi di berbagai versi MySQL
	return JSON.stringify(analysisResult);
};

/**
 * Membuat data pasien baru
 * @route POST /api/patients
 * @access Public
 */
const createPatient = async (req, res, next) => {
	try {
		const patientData = req.body;

		// Validasi data pasien
		const requiredFields = [
			"name",
			"age",
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

		// Simpan data pasien ke database dengan diagnosisData sebagai string JSON
		const diagnosisData = prepareDiagnosisData(analysisResult);

		// Log untuk debugging (opsional)
		console.log("Diagnosis Data:", diagnosisData);

		const [result] = await pool.query(
			`
      INSERT INTO patients (
        name, age, gender, medicalHistory, 
        hemoglobin, redBloodCell, whiteBloodCell, platelet, 
        hematocrit, mcv, mch, mchc, 
        neutrophils, lymphocytes, monocytes, eosinophils, basophils,
        diagnosis, diagnosisData
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
			[
				patientData.name,
				patientData.age,
				patientData.gender,
				patientData.medicalHistory || null,
				patientData.hemoglobin,
				patientData.redBloodCell,
				patientData.whiteBloodCell,
				patientData.platelet,
				patientData.hematocrit || null,
				patientData.mcv || null,
				patientData.mch || null,
				patientData.mchc || null,
				patientData.neutrophils || null,
				patientData.lymphocytes || null,
				patientData.monocytes || null,
				patientData.eosinophils || null,
				patientData.basophils || null,
				analysisResult.diagnosis,
				diagnosisData, // Sekarang sudah dalam bentuk string JSON
			]
		);

		// Return data pasien dan hasil analisis
		res.status(201).json({
			success: true,
			id: result.insertId,
			...analysisResult,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Mengupdate data pasien (perbaikan juga untuk fungsi ini)
 */
const updatePatient = async (req, res, next) => {
	try {
		const { id } = req.params;
		const patientData = req.body;

		// Cek apakah pasien ada
		const [existingPatient] = await pool.query(
			"SELECT * FROM patients WHERE id = ?",
			[id]
		);

		if (existingPatient.length === 0) {
			return res.status(404).json({
				success: false,
				message: "Pasien tidak ditemukan",
			});
		}

		// Validasi data pasien
		const requiredFields = [
			"name",
			"age",
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

		// Siapkan diagnosisData untuk penyimpanan
		const diagnosisData = prepareDiagnosisData(analysisResult);

		// Update data pasien
		await pool.query(
			`
      UPDATE patients SET
        name = ?,
        age = ?,
        gender = ?,
        medicalHistory = ?,
        hemoglobin = ?,
        redBloodCell = ?,
        whiteBloodCell = ?,
        platelet = ?,
        hematocrit = ?,
        mcv = ?,
        mch = ?,
        mchc = ?,
        neutrophils = ?,
        lymphocytes = ?,
        monocytes = ?,
        eosinophils = ?,
        basophils = ?,
        diagnosis = ?,
        diagnosisData = ?
      WHERE id = ?
    `,
			[
				patientData.name,
				patientData.age,
				patientData.gender,
				patientData.medicalHistory || null,
				patientData.hemoglobin,
				patientData.redBloodCell,
				patientData.whiteBloodCell,
				patientData.platelet,
				patientData.hematocrit || null,
				patientData.mcv || null,
				patientData.mch || null,
				patientData.mchc || null,
				patientData.neutrophils || null,
				patientData.lymphocytes || null,
				patientData.monocytes || null,
				patientData.eosinophils || null,
				patientData.basophils || null,
				analysisResult.diagnosis,
				diagnosisData,
				id,
			]
		);

		res.json({
			success: true,
			message: "Data pasien berhasil diupdate",
			id: parseInt(id),
			...analysisResult,
		});
	} catch (error) {
		next(error);
	}
};

// Fungsi lainnya tetap sama
const getAllPatients = async (req, res, next) => {
	try {
		const [rows] = await pool.query(
			"SELECT * FROM patients ORDER BY createdAt DESC"
		);

		res.json({
			success: true,
			count: rows.length,
			data: rows,
		});
	} catch (error) {
		next(error);
	}
};

const getPatientById = async (req, res, next) => {
	try {
		const { id } = req.params;

		const [rows] = await pool.query("SELECT * FROM patients WHERE id = ?", [
			id,
		]);

		if (rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "Pasien tidak ditemukan",
			});
		}

		res.json({
			success: true,
			data: rows[0],
		});
	} catch (error) {
		next(error);
	}
};

const deletePatient = async (req, res, next) => {
	try {
		const { id } = req.params;

		// Cek apakah pasien ada
		const [existingPatient] = await pool.query(
			"SELECT id FROM patients WHERE id = ?",
			[id]
		);

		if (existingPatient.length === 0) {
			return res.status(404).json({
				success: false,
				message: "Pasien tidak ditemukan",
			});
		}

		// Hapus data pasien
		await pool.query("DELETE FROM patients WHERE id = ?", [id]);

		res.json({
			success: true,
			message: "Data pasien berhasil dihapus",
		});
	} catch (error) {
		next(error);
	}
};

// Export semua fungsi controller
module.exports = {
	getAllPatients,
	getPatientById,
	createPatient,
	updatePatient,
	deletePatient,
};
