const fs = require("fs").promises;

// Generate CSV report for blood test data
exports.generateCsvReport = async (reportData, filePath) => {
	try {
		// Create CSV header
		let csvContent = "Parameter,Nilai,Satuan,Rentang Normal\n";

		// Add patient info as comments
		csvContent += `# Laporan Tes Darah\n`;
		csvContent += `# Tanggal: ${reportData.testDate}\n`;
		csvContent += `# Nama Pasien: ${reportData.patientName}\n`;
		csvContent += `# Usia: ${reportData.patientAge} tahun\n`;
		csvContent += `# Jenis Kelamin: ${reportData.patientGender}\n\n`;

		// Add parameters
		const normalRanges = {
			hemoglobin:
				reportData.patientGender === "Laki-laki"
					? "13.5 - 17.5"
					: "12.0 - 15.5",
			hematocrit:
				reportData.patientGender === "Laki-laki" ? "41 - 50" : "36 - 44",
			erythrocytes:
				reportData.patientGender === "Laki-laki" ? "4.7 - 6.1" : "4.2 - 5.4",
			leukocytes: "4,500 - 11,000",
			thrombocytes: "150,000 - 450,000",
			mcv: "80 - 96",
			mch: "27 - 33",
			mchc: "33 - 36",
		};

		const units = {
			hemoglobin: "g/dL",
			hematocrit: "%",
			erythrocytes: "juta/μL",
			leukocytes: "/μL",
			thrombocytes: "/μL",
			mcv: "fL",
			mch: "pg",
			mchc: "g/dL",
		};

		// Add each parameter to CSV
		Object.entries(reportData.parameters).forEach(([key, value]) => {
			if (value !== null && value !== undefined) {
				const paramName = key.charAt(0).toUpperCase() + key.slice(1);
				csvContent += `${paramName},${value},${units[key]},${normalRanges[key]}\n`;
			}
		});

		// Add notes if any
		if (reportData.notes) {
			csvContent += `\n# Catatan: ${reportData.notes}\n`;
		}

		// Add disclaimer
		csvContent +=
			"\n# DISCLAIMER: Laporan ini hanya sebagai referensi dan tidak menggantikan diagnosis medis profesional.";
		csvContent +=
			"\n# Konsultasikan dengan dokter untuk interpretasi hasil dan perawatan.";

		// Write to file
		await fs.writeFile(filePath, csvContent);

		return filePath;
	} catch (error) {
		console.error("Error generating CSV report:", error);
		throw error;
	}
};

// Generate CSV report for detection results
exports.generateDetectionCsvReport = async (reportData, filePath) => {
	try {
		// Create CSV content
		let csvContent = "# LAPORAN DETEKSI PENYAKIT\n";
		csvContent += `# Tanggal Tes: ${reportData.testDate}\n`;
		csvContent += `# Tanggal Deteksi: ${reportData.detectionDate}\n`;
		csvContent += `# Nama Pasien: ${reportData.patientName}\n`;
		csvContent += `# Usia: ${reportData.patientAge} tahun\n`;
		csvContent += `# Jenis Kelamin: ${reportData.patientGender}\n\n`;

		// Add abnormal parameters section
		if (Object.keys(reportData.abnormalParameters).length > 0) {
			csvContent += "PARAMETER ABNORMAL\n";
			csvContent += "Parameter,Nilai,Status,Rentang Normal\n";

			Object.entries(reportData.abnormalParameters).forEach(([key, data]) => {
				const paramName = key.charAt(0).toUpperCase() + key.slice(1);
				const status = data.status === "low" ? "Rendah" : "Tinggi";
				csvContent += `${paramName},${data.value},${status},${data.normalRange}\n`;
			});

			csvContent += "\n";
		} else {
			csvContent +=
				"PARAMETER ABNORMAL: Tidak ada parameter abnormal terdeteksi.\n\n";
		}

		// Add possible conditions section
		csvContent += "KEMUNGKINAN KONDISI\n";

		reportData.possibleConditions.forEach((condition, index) => {
			csvContent += `${index + 1}. ${condition.name} (Probabilitas: ${
				condition.probability
			})\n`;
			csvContent += `   Deskripsi: ${condition.description}\n`;
			csvContent += "   Rekomendasi:\n";

			condition.recommendations.forEach((rec) => {
				csvContent += `   - ${rec}\n`;
			});

			csvContent += "\n";
		});

		// Add analysis time
		csvContent += `Waktu Analisis: ${reportData.analysisTime}\n\n`;

		// Add disclaimer
		csvContent +=
			"# DISCLAIMER: Hasil deteksi ini hanya sebagai referensi awal dan tidak menggantikan diagnosis medis profesional.\n";
		csvContent +=
			"# Konsultasikan dengan dokter untuk evaluasi lebih lanjut.\n";

		// Write to file
		await fs.writeFile(filePath, csvContent);

		return filePath;
	} catch (error) {
		console.error("Error generating detection CSV report:", error);
		throw error;
	}
};

// Generate CSV report for user history
exports.generateHistoryCsvReport = async (bloodTests, filePath) => {
	try {
		// Create CSV header
		let csvContent =
			"ID,Tanggal,Nama Pasien,Hemoglobin,Hematokrit,Eritrosit,Leukosit,Trombosit,MCV,MCH,MCHC\n";

		// Add each blood test to CSV
		bloodTests.forEach((test) => {
			const date = new Date(test.test_date).toLocaleDateString("id-ID");

			csvContent += `${test.id},${date},${test.patient_name},`;
			csvContent += `${test.hemoglobin || ""},${test.hematocrit || ""},${
				test.erythrocytes || ""
			},`;
			csvContent += `${test.leukocytes || ""},${test.thrombocytes || ""},${
				test.mcv || ""
			},`;
			csvContent += `${test.mch || ""},${test.mchc || ""}\n`;
		});

		// Add generation info
		csvContent += `\n# Laporan dibuat pada: ${new Date().toLocaleDateString(
			"id-ID"
		)} ${new Date().toLocaleTimeString("id-ID")}\n`;
		csvContent += "# Total tes: " + bloodTests.length + "\n";

		// Write to file
		await fs.writeFile(filePath, csvContent);

		return filePath;
	} catch (error) {
		console.error("Error generating history CSV report:", error);
		throw error;
	}
};
