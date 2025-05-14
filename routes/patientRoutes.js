// routes/patientRoutes.js - Route untuk pasien
const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const {
	authenticateToken,
	adminOnly,
} = require("../middlewares/authMiddleware");

// Route publik untuk membuat pasien baru (form pasien)
router.post("/", patientController.createPatient);

// Route publik untuk mendapatkan data pasien berdasarkan ID
router.get("/:id", patientController.getPatientById);

// Route terproteksi untuk mendapatkan semua data pasien
router.get("/", patientController.getAllPatients);

// Route terproteksi untuk update data pasien (admin only)
router.put(
	"/:id",
	authenticateToken,
	adminOnly,
	patientController.updatePatient
);

// Route terproteksi untuk hapus data pasien (admin only)
router.delete(
	"/:id",
	authenticateToken,
	adminOnly,
	patientController.deletePatient
);

module.exports = router;
