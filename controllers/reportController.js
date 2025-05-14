// controllers/reportController.js - Controller untuk laporan
const { pool } = require("../config/db");
const { createObjectCsvWriter } = require("csv-writer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Mendapatkan statistik data pasien
 * @route GET /api/reports/stats
 * @access Public
 */
const getStats = async (req, res, next) => {
	try {
		const { from, to } = req.query;

		// Buat filter tanggal jika ada
		let dateFilter = "";
		let dateParams = [];

		if (from && to) {
			dateFilter = "WHERE createdAt BETWEEN ? AND ?";
			// Tambahkan waktu ke tanggal 'to' untuk mencakup seluruh hari
			dateParams = [from, `${to} 23:59:59`];
		} else if (from) {
			dateFilter = "WHERE createdAt >= ?";
			dateParams = [from];
		} else if (to) {
			dateFilter = "WHERE createdAt <= ?";
			dateParams = [`${to} 23:59:59`];
		}

		// Dapatkan total pasien
		const [totalResult] = await pool.query(
			`SELECT COUNT(*) as total FROM patients ${dateFilter}`,
			dateParams
		);
		const totalPatients = totalResult[0].total;

		// Dapatkan distribusi diagnosis
		const [diagnosisResult] = await pool.query(
			`SELECT diagnosis as name, COUNT(*) as value 
       FROM patients ${dateFilter} 
       GROUP BY diagnosis 
       ORDER BY value DESC`,
			dateParams
		);

		// Dapatkan distribusi jenis kelamin
		const [genderResult] = await pool.query(
			`SELECT gender as name, COUNT(*) as value 
       FROM patients ${dateFilter} 
       GROUP BY gender`,
			dateParams
		);

		// Dapatkan distribusi kelompok umur
		const [ageResult] = await pool.query(
			`SELECT 
         CASE
           WHEN age < 18 THEN '< 18 tahun'
           WHEN age BETWEEN 18 AND 30 THEN '18-30 tahun'
           WHEN age BETWEEN 31 AND 45 THEN '31-45 tahun'
           WHEN age BETWEEN 46 AND 60 THEN '46-60 tahun'
           ELSE '> 60 tahun'
         END as name,
         COUNT(*) as value
       FROM patients ${dateFilter}
       GROUP BY name
       ORDER BY 
         CASE name
           WHEN '< 18 tahun' THEN 1
           WHEN '18-30 tahun' THEN 2
           WHEN '31-45 tahun' THEN 3
           WHEN '46-60 tahun' THEN 4
           ELSE 5
         END`,
			dateParams
		);

		res.json({
			success: true,
			data: {
				totalPatients,
				diagnosisCounts: diagnosisResult,
				genderDistribution: genderResult,
				ageGroups: ageResult,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Export data pasien ke CSV
 * @route GET /api/reports/export-csv
 * @access Private
 */
const exportToCsv = async (req, res, next) => {
	try {
		const { from, to } = req.query;

		// Buat filter tanggal jika ada
		let dateFilter = "";
		let dateParams = [];

		if (from && to) {
			dateFilter = "WHERE createdAt BETWEEN ? AND ?";
			// Tambahkan waktu ke tanggal 'to' untuk mencakup seluruh hari
			dateParams = [from, `${to} 23:59:59`];
		} else if (from) {
			dateFilter = "WHERE createdAt >= ?";
			dateParams = [from];
		} else if (to) {
			dateFilter = "WHERE createdAt <= ?";
			dateParams = [`${to} 23:59:59`];
		}

		// Dapatkan data pasien
		const [rows] = await pool.query(
			`SELECT * FROM patients ${dateFilter} ORDER BY createdAt DESC`,
			dateParams
		);

		// Buat file sementara
		const timestamp = new Date().toISOString().replace(/[:.-]/g, "");
		const csvFilePath = path.join(
			__dirname,
			"..",
			"temp",
			`bloodaldo_report_${timestamp}.csv`
		);

		// Pastikan direktori temp ada
		const tempDir = path.join(__dirname, "..", "temp");
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}

		// Buat CSV writer
		const csvWriter = createObjectCsvWriter({
			path: csvFilePath,
			header: [
				{ id: "id", title: "ID" },
				{ id: "name", title: "Nama" },
				{ id: "age", title: "Umur" },
				{ id: "gender", title: "Jenis Kelamin" },
				{ id: "medicalHistory", title: "Riwayat Penyakit" },
				{ id: "hemoglobin", title: "Hemoglobin (g/dL)" },
				{ id: "redBloodCell", title: "Sel Darah Merah (10^6/µL)" },
				{ id: "whiteBloodCell", title: "Sel Darah Putih (10^3/µL)" },
				{ id: "platelet", title: "Trombosit (10^3/µL)" },
				{ id: "hematocrit", title: "Hematokrit (%)" },
				{ id: "mcv", title: "MCV (fL)" },
				{ id: "mch", title: "MCH (pg)" },
				{ id: "mchc", title: "MCHC (g/dL)" },
				{ id: "neutrophils", title: "Neutrofil (%)" },
				{ id: "lymphocytes", title: "Limfosit (%)" },
				{ id: "monocytes", title: "Monosit (%)" },
				{ id: "eosinophils", title: "Eosinofil (%)" },
				{ id: "basophils", title: "Basofil (%)" },
				{ id: "diagnosis", title: "Diagnosis" },
				{ id: "createdAt", title: "Tanggal Pemeriksaan" },
			],
		});

		// Format tanggal
		const records = rows.map((row) => ({
			...row,
			createdAt: new Date(row.createdAt).toLocaleString("id-ID"),
		}));

		// Tulis ke file CSV
		await csvWriter.writeRecords(records);

		// Kirim file
		res.download(csvFilePath, `bloodaldo_report_${timestamp}.csv`, (err) => {
			if (err) {
				next(err);
			} else {
				// Hapus file setelah dikirim
				setTimeout(() => {
					fs.unlinkSync(csvFilePath);
				}, 1000);
			}
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Export data pasien ke PDF
 * @route GET /api/reports/export-pdf
 * @access Private
 */
const exportToPdf = async (req, res, next) => {
	try {
		const { from, to } = req.query;

		// Buat filter tanggal jika ada
		let dateFilter = "";
		let dateParams = [];
		let dateRangeText = "Semua Data";

		if (from && to) {
			dateFilter = "WHERE createdAt BETWEEN ? AND ?";
			// Tambahkan waktu ke tanggal 'to' untuk mencakup seluruh hari
			dateParams = [from, `${to} 23:59:59`];
			dateRangeText = `${new Date(from).toLocaleDateString(
				"id-ID"
			)} - ${new Date(to).toLocaleDateString("id-ID")}`;
		} else if (from) {
			dateFilter = "WHERE createdAt >= ?";
			dateParams = [from];
			dateRangeText = `Dari ${new Date(from).toLocaleDateString("id-ID")}`;
		} else if (to) {
			dateFilter = "WHERE createdAt <= ?";
			dateParams = [`${to} 23:59:59`];
			dateRangeText = `Sampai ${new Date(to).toLocaleDateString("id-ID")}`;
		}

		// Dapatkan data pasien
		const [patients] = await pool.query(
			`SELECT * FROM patients ${dateFilter} ORDER BY createdAt DESC`,
			dateParams
		);

		// Dapatkan statistik
		const [totalResult] = await pool.query(
			`SELECT COUNT(*) as total FROM patients ${dateFilter}`,
			dateParams
		);

		const [diagnosisResult] = await pool.query(
			`SELECT diagnosis, COUNT(*) as count 
       FROM patients ${dateFilter} 
       GROUP BY diagnosis 
       ORDER BY count DESC`,
			dateParams
		);

		const [genderResult] = await pool.query(
			`SELECT gender, COUNT(*) as count 
       FROM patients ${dateFilter} 
       GROUP BY gender`,
			dateParams
		);

		// Buat file sementara
		const timestamp = new Date().toISOString().replace(/[:.-]/g, "");
		const tempDir = path.join(__dirname, "..", "temp");
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}
		const pdfFilePath = path.join(tempDir, `bloodaldo_report_${timestamp}.pdf`);

		// Buat PDF
		const doc = new PDFDocument({ margin: 50 });
		const stream = fs.createWriteStream(pdfFilePath);
		doc.pipe(stream);

		// Header
		doc
			.fontSize(20)
			.font("Helvetica-Bold")
			.text("Laporan Data Pasien Bloodaldo", { align: "center" });
		doc.moveDown();
		doc
			.fontSize(12)
			.font("Helvetica")
			.text(`Tanggal Laporan: ${new Date().toLocaleDateString("id-ID")}`, {
				align: "center",
			});
		doc.fontSize(12).text(`Periode: ${dateRangeText}`, { align: "center" });
		doc.moveDown();

		// Ringkasan
		doc.fontSize(16).font("Helvetica-Bold").text("Ringkasan");
		doc.moveDown();
		doc
			.fontSize(12)
			.font("Helvetica")
			.text(`Total Pasien: ${totalResult[0].total}`);

		// Distribusi diagnosis
		if (diagnosisResult.length > 0) {
			doc.moveDown();
			doc.fontSize(14).font("Helvetica-Bold").text("Distribusi Diagnosis");
			doc.moveDown();

			diagnosisResult.forEach((item) => {
				doc
					.fontSize(12)
					.font("Helvetica")
					.text(
						`${item.diagnosis || "Tidak ada diagnosis"}: ${item.count} pasien`
					);
			});
		}

		// Distribusi jenis kelamin
		if (genderResult.length > 0) {
			doc.moveDown();
			doc.fontSize(14).font("Helvetica-Bold").text("Distribusi Jenis Kelamin");
			doc.moveDown();

			genderResult.forEach((item) => {
				doc
					.fontSize(12)
					.font("Helvetica")
					.text(`${item.gender}: ${item.count} pasien`);
			});
		}

		// Daftar pasien
		doc.addPage();
		doc.fontSize(16).font("Helvetica-Bold").text("Daftar Pasien");
		doc.moveDown();

		// Header tabel
		const tableTop = doc.y;
		const tableLeft = 50;
		const colWidths = [150, 80, 80, 150];

		doc
			.fontSize(10)
			.font("Helvetica-Bold")
			.text("Nama", tableLeft, tableTop)
			.text("Umur", tableLeft + colWidths[0], tableTop)
			.text("Gender", tableLeft + colWidths[0] + colWidths[1], tableTop)
			.text(
				"Diagnosis",
				tableLeft + colWidths[0] + colWidths[1] + colWidths[2],
				tableTop
			);

		doc
			.moveTo(tableLeft, tableTop + 15)
			.lineTo(
				tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
				tableTop + 15
			)
			.stroke();

		let rowTop = tableTop + 20;

		// Baris tabel
		patients.forEach((patient, index) => {
			// Tambah halaman baru jika diperlukan
			if (rowTop > doc.page.height - 50) {
				doc.addPage();
				rowTop = 50;
			}

			doc
				.fontSize(10)
				.font("Helvetica")
				.text(patient.name, tableLeft, rowTop, {
					width: colWidths[0],
					ellipsis: true,
				})
				.text(`${patient.age} tahun`, tableLeft + colWidths[0], rowTop)
				.text(patient.gender, tableLeft + colWidths[0] + colWidths[1], rowTop)
				.text(
					patient.diagnosis || "Tidak ada",
					tableLeft + colWidths[0] + colWidths[1] + colWidths[2],
					rowTop,
					{ width: colWidths[3], ellipsis: true }
				);

			rowTop += 20;
		});

		// Footer
		doc
			.fontSize(8)
			.font("Helvetica")
			.text(
				"Generated by Bloodaldo - Sistem Pakar Deteksi Dini Penyakit Melalui Data Bank Darah",
				{
					align: "center",
					y: doc.page.height - 50,
				}
			);

		// Finalisasi PDF
		doc.end();

		// Tunggu PDF selesai ditulis
		stream.on("finish", () => {
			// Kirim file
			res.download(pdfFilePath, `bloodaldo_report_${timestamp}.pdf`, (err) => {
				if (err) {
					next(err);
				} else {
					// Hapus file setelah dikirim
					setTimeout(() => {
						fs.unlinkSync(pdfFilePath);
					}, 1000);
				}
			});
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getStats,
	exportToCsv,
	exportToPdf,
};
