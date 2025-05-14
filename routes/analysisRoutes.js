// routes/analysisRoutes.js - Route untuk analisis data darah
const express = require("express");
const router = express.Router();
const {
	getAnalysisByPatientId,
	analyzeBloodDataOnly,
	getReferenceValues,
} = require("../controllers/analysisController");

// Route untuk mendapatkan analisis berdasarkan ID pasien
router.get("/:patientId", getAnalysisByPatientId);

// Route untuk menganalisis data darah tanpa menyimpan ke database
router.post("/analyze", analyzeBloodDataOnly);

// Route untuk mendapatkan nilai referensi parameter darah
router.get("/reference/values", getReferenceValues);

module.exports = router;
