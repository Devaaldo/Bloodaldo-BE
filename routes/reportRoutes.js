// routes/reportRoutes.js - Route untuk laporan
const express = require("express");
const router = express.Router();
const {
	getStats,
	exportToCsv,
	exportToPdf,
} = require("../controllers/reportController");
const {
	authenticateToken,
	adminOnly,
} = require("../middlewares/authMiddleware");

// Route publik untuk mendapatkan statistik
router.get("/stats", getStats);

// Route terproteksi untuk ekspor CSV (admin only)
router.get("/export-csv", authenticateToken, adminOnly, exportToCsv);

// Route terproteksi untuk ekspor PDF (admin only)
router.get("/export-pdf", authenticateToken, adminOnly, exportToPdf);

module.exports = router;
