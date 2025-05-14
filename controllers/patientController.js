// controllers/patientController.js - Controller untuk data pasien
const { pool } = require("../config/db");
const { analyzeBloodData } = require("../utils/expertSystem");

/**
 * Mendapatkan semua data pasien
 * @route GET /api/patients
 * @access Private
 */
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

/**
 * Mendapatkan data pasien berdasarkan ID
 * @route GET /api/patients/:id
 * @access Private
 */
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

		// Simpan data pasien ke database
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
				JSON.stringify(analysisResult),
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
 * Mengupdate data pasien
 * @route PUT /api/patients/:id
 * @access Private
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
				JSON.stringify(analysisResult),
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

/**
 * Menghapus data pasien
 * @route DELETE /api/patients/:id
 * @access Private
 */
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

module.exports = {
	getAllPatients,
	getPatientById,
	createPatient,
	updatePatient,
	deletePatient,
};
