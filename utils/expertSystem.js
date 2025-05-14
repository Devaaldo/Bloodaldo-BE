// utils/expertSystem.js - Implementasi sistem pakar untuk analisis data darah
/**
 * Menganalisis data darah pasien dan menghasilkan diagnosa berdasarkan rule-based system
 * @param {Object} patientData - Data pasien lengkap dengan parameter darah
 * @returns {Object} Hasil analisis berupa diagnosa, probabilitas, penjelasan, dan rekomendasi
 */
const analyzeBloodData = (patientData) => {
	// Memastikan semua parameter yang dibutuhkan ada
	const {
		gender,
		age,
		hemoglobin,
		redBloodCell,
		whiteBloodCell,
		platelet,
		hematocrit,
		mcv,
		mch,
		mchc,
		neutrophils,
		lymphocytes,
		monocytes,
		eosinophils,
		basophils,
	} = patientData;

	// Definisi nilai normal untuk berbagai parameter darah
	const normalRanges = {
		hemoglobin:
			gender === "Laki-laki" ? { min: 14, max: 18 } : { min: 12, max: 16 },
		redBloodCell:
			gender === "Laki-laki" ? { min: 4.7, max: 6.1 } : { min: 4.2, max: 5.4 },
		whiteBloodCell: { min: 4.5, max: 11 },
		platelet: { min: 150, max: 450 },
		hematocrit:
			gender === "Laki-laki" ? { min: 41, max: 53 } : { min: 36, max: 46 },
		mcv: { min: 80, max: 100 },
		mch: { min: 27, max: 31 },
		mchc: { min: 32, max: 36 },
		neutrophils: { min: 40, max: 60 },
		lymphocytes: { min: 20, max: 40 },
		monocytes: { min: 2, max: 8 },
		eosinophils: { min: 1, max: 4 },
		basophils: { min: 0, max: 1 },
	};

	// Array untuk menyimpan hasil diagnosa
	const results = [];

	// Rule 1: Deteksi Anemia
	if (hemoglobin < normalRanges.hemoglobin.min) {
		const severity =
			(normalRanges.hemoglobin.min - hemoglobin) / normalRanges.hemoglobin.min;
		const probability = 0.7 + severity * 0.3; // Probabilitas antara 0.7-1.0 tergantung keparahan

		results.push({
			disease: "Anemia",
			probability: parseFloat(probability.toFixed(2)),
			explanation:
				"Kadar hemoglobin yang rendah menunjukkan anemia, kondisi di mana tubuh tidak memiliki cukup sel darah merah sehat.",
			recommendations: [
				"Konsumsi makanan yang kaya zat besi seperti daging merah, bayam, dan kacang-kacangan",
				"Konsultasikan dengan dokter untuk kemungkinan suplementasi zat besi",
				"Lakukan pemeriksaan lebih lanjut untuk menentukan penyebab anemia",
			],
		});
	}

	// Rule 2: Deteksi Anemia Defisiensi Besi (Iron Deficiency Anemia)
	if (
		hemoglobin < normalRanges.hemoglobin.min &&
		mcv < normalRanges.mcv.min &&
		mch < normalRanges.mch.min
	) {
		results.push({
			disease: "Anemia Defisiensi Besi",
			probability: 0.85,
			explanation:
				"Kadar hemoglobin rendah dengan ukuran sel darah merah yang kecil (mikrositik) dan kandungan hemoglobin sel rendah menunjukkan anemia defisiensi besi.",
			recommendations: [
				"Konsumsi makanan kaya zat besi",
				"Hindari konsumsi teh dan kopi bersamaan dengan makan, karena dapat menghambat penyerapan zat besi",
				"Konsultasikan dengan dokter untuk suplementasi zat besi",
				"Lakukan pemeriksaan untuk menentukan sumber kehilangan darah (jika ada)",
			],
		});
	}

	// Rule 3: Deteksi Anemia Megaloblastik (B12 atau Folat)
	if (hemoglobin < normalRanges.hemoglobin.min && mcv > normalRanges.mcv.max) {
		results.push({
			disease: "Anemia Megaloblastik",
			probability: 0.8,
			explanation:
				"Kadar hemoglobin rendah dengan ukuran sel darah merah yang besar (makrositik) menunjukkan anemia megaloblastik, sering disebabkan defisiensi vitamin B12 atau asam folat.",
			recommendations: [
				"Konsumsi makanan kaya vitamin B12 seperti daging, telur, produk susu",
				"Konsumsi makanan kaya asam folat seperti sayuran hijau, kacang-kacangan",
				"Konsultasikan dengan dokter untuk suplementasi B12 atau asam folat",
				"Lakukan pemeriksaan lanjutan untuk menentukan penyebab pasti",
			],
		});
	}

	// Rule 4: Deteksi Infeksi atau Peradangan
	if (whiteBloodCell > normalRanges.whiteBloodCell.max) {
		const severity =
			(whiteBloodCell - normalRanges.whiteBloodCell.max) /
			normalRanges.whiteBloodCell.max;
		const probability = 0.65 + severity * 0.3; // Probabilitas antara 0.65-0.95

		results.push({
			disease: "Infeksi atau Peradangan",
			probability: parseFloat(probability.toFixed(2)),
			explanation:
				"Peningkatan sel darah putih (leukositosis) menunjukkan kemungkinan adanya infeksi atau proses peradangan dalam tubuh.",
			recommendations: [
				"Istirahat yang cukup",
				"Konsumsi cairan yang cukup",
				"Konsultasikan dengan dokter untuk evaluasi lebih lanjut",
				"Hindari aktivitas berat sampai kondisi membaik",
			],
		});
	}

	// Rule 5: Deteksi Leukopenia (Penurunan Sel Darah Putih)
	if (whiteBloodCell < normalRanges.whiteBloodCell.min) {
		results.push({
			disease: "Leukopenia",
			probability: 0.75,
			explanation:
				"Penurunan jumlah sel darah putih dapat mengurangi kemampuan tubuh untuk melawan infeksi.",
			recommendations: [
				"Hindari kontak dengan orang yang sedang sakit",
				"Jaga kebersihan diri dan lingkungan",
				"Konsumsi makanan bergizi seimbang",
				"Konsultasikan dengan dokter untuk evaluasi lebih lanjut",
			],
		});
	}

	// Rule 6: Deteksi Trombositopenia (Kekurangan Trombosit)
	if (platelet < normalRanges.platelet.min) {
		const severity =
			(normalRanges.platelet.min - platelet) / normalRanges.platelet.min;
		const probability = 0.7 + severity * 0.25; // Probabilitas antara 0.7-0.95

		results.push({
			disease: "Trombositopenia",
			probability: parseFloat(probability.toFixed(2)),
			explanation:
				"Jumlah trombosit yang rendah dapat menyebabkan gangguan pembekuan darah dan meningkatkan risiko perdarahan.",
			recommendations: [
				"Hindari penggunaan obat pengencer darah seperti aspirin",
				"Hindari aktivitas yang berisiko cedera fisik",
				"Perhatikan tanda-tanda perdarahan seperti memar yang mudah terjadi, mimisan, atau gusi berdarah",
				"Konsultasikan dengan dokter untuk evaluasi lebih lanjut",
			],
		});
	}

	// Rule 7: Deteksi Trombositosis (Kelebihan Trombosit)
	if (platelet > normalRanges.platelet.max) {
		results.push({
			disease: "Trombositosis",
			probability: 0.7,
			explanation:
				"Peningkatan jumlah trombosit dapat meningkatkan risiko pembekuan darah yang tidak normal.",
			recommendations: [
				"Konsumsi air putih yang cukup",
				"Hindari merokok dan minuman beralkohol",
				"Konsultasikan dengan dokter untuk evaluasi lebih lanjut",
				"Hindari penggunaan kontrasepsi hormonal (untuk wanita) tanpa konsultasi dokter",
			],
		});
	}

	// Rule 8: Deteksi Polisitemia (Kelebihan Sel Darah Merah)
	if (
		redBloodCell > normalRanges.redBloodCell.max &&
		hemoglobin > normalRanges.hemoglobin.max &&
		hematocrit > normalRanges.hematocrit.max
	) {
		results.push({
			disease: "Polisitemia",
			probability: 0.8,
			explanation:
				"Peningkatan sel darah merah, hemoglobin, dan hematokrit menunjukkan polisitemia, kondisi di mana tubuh memproduksi terlalu banyak sel darah merah.",
			recommendations: [
				"Hindari merokok dan minuman beralkohol",
				"Konsumsi air putih yang cukup",
				"Hindari aktivitas di ketinggian tinggi tanpa aklimatisasi yang tepat",
				"Konsultasikan dengan dokter untuk evaluasi lebih lanjut",
			],
		});
	}

	// Rule 9: Deteksi Neutrofilia (Peningkatan Neutrofil)
	if (neutrophils > normalRanges.neutrophils.max) {
		results.push({
			disease: "Neutrofilia",
			probability: 0.7,
			explanation:
				"Peningkatan persentase neutrofil sering menunjukkan adanya infeksi bakteri akut atau peradangan.",
			recommendations: [
				"Istirahat yang cukup",
				"Konsumsi cairan yang cukup",
				"Konsultasikan dengan dokter untuk evaluasi lebih lanjut",
				"Hindari aktivitas berat sampai kondisi membaik",
			],
		});
	}

	// Rule 10: Deteksi Limfositosis (Peningkatan Limfosit)
	if (lymphocytes > normalRanges.lymphocytes.max) {
		results.push({
			disease: "Limfositosis",
			probability: 0.65,
			explanation:
				"Peningkatan persentase limfosit sering menunjukkan adanya infeksi virus atau kondisi autoimun.",
			recommendations: [
				"Istirahat yang cukup",
				"Konsumsi cairan yang cukup",
				"Hindari kontak dengan orang yang sedang sakit",
				"Konsultasikan dengan dokter untuk evaluasi lebih lanjut",
			],
		});
	}

	// Rule 11: Deteksi Eosinofilia (Peningkatan Eosinofil)
	if (eosinophils > normalRanges.eosinophils.max) {
		results.push({
			disease: "Eosinofilia",
			probability: 0.7,
			explanation:
				"Peningkatan jumlah eosinofil sering terkait dengan kondisi alergi, infeksi parasit, atau kondisi autoimun.",
			recommendations: [
				"Hindari alergen yang diketahui",
				"Jaga kebersihan lingkungan untuk mengurangi paparan alergen",
				"Konsultasikan dengan dokter untuk evaluasi lebih lanjut",
				"Perhatikan gejala alergi seperti ruam, gatal, atau kesulitan bernapas",
			],
		});
	}

	// Jika tidak ada masalah terdeteksi, dianggap normal
	if (results.length === 0) {
		return {
			diagnosis: "Normal",
			mainProbability: 0.9,
			explanation: "Semua parameter darah berada dalam rentang normal.",
			recommendations: [
				"Pertahankan pola hidup sehat dengan diet seimbang",
				"Lakukan aktivitas fisik secara teratur",
				"Lakukan pemeriksaan darah rutin setahun sekali",
				"Jaga hidrasi dengan minum air yang cukup",
			],
			probabilities: [{ disease: "Normal", probability: 0.9 }],
		};
	}

	// Urutkan hasil berdasarkan probabilitas tertinggi
	results.sort((a, b) => b.probability - a.probability);

	// Ambil diagnosa utama (dengan probabilitas tertinggi)
	const mainDiagnosis = results[0];

	return {
		diagnosis: mainDiagnosis.disease,
		mainProbability: mainDiagnosis.probability,
		explanation: mainDiagnosis.explanation,
		recommendations: mainDiagnosis.recommendations,
		probabilities: results,
	};
};

module.exports = {
	analyzeBloodData,
};
