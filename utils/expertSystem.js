/**
 * Expert System for Blood Test Analysis
 * This implements a rule-based expert system to analyze blood test parameters
 * and detect possible diseases or conditions.
 */

// Define normal ranges based on gender
const getNormalRanges = (gender) => {
	return {
		hemoglobin:
			gender === "male" ? { min: 13.5, max: 17.5 } : { min: 12.0, max: 15.5 },
		hematocrit: gender === "male" ? { min: 41, max: 50 } : { min: 36, max: 44 },
		erythrocytes:
			gender === "male" ? { min: 4.7, max: 6.1 } : { min: 4.2, max: 5.4 },
		leukocytes: { min: 4500, max: 11000 },
		thrombocytes: { min: 150000, max: 450000 },
		mcv: { min: 80, max: 96 },
		mch: { min: 27, max: 33 },
		mchc: { min: 33, max: 36 },
	};
};

// Analyze blood test parameters and identify abnormal values
const identifyAbnormalParameters = (parameters, normalRanges) => {
	const abnormalParameters = {};

	Object.entries(parameters).forEach(([key, value]) => {
		// Skip null, undefined, or NaN values
		if (
			normalRanges[key] &&
			value !== null &&
			value !== undefined &&
			!isNaN(value)
		) {
			// Convert value to float to ensure proper comparison
			const numValue = parseFloat(value);

			if (numValue < normalRanges[key].min) {
				abnormalParameters[key] = {
					value: numValue,
					status: "low",
					normalRange: `${normalRanges[key].min} - ${normalRanges[key].max}`,
				};
			} else if (numValue > normalRanges[key].max) {
				abnormalParameters[key] = {
					value: numValue,
					status: "high",
					normalRange: `${normalRanges[key].min} - ${normalRanges[key].max}`,
				};
			}
		}
	});

	return abnormalParameters;
};

// Apply rules to identify possible conditions
const applyRules = (abnormalParameters, patientData) => {
	const possibleConditions = [];

	// Rule 1: Anemia (low hemoglobin)
	if (
		abnormalParameters.hemoglobin &&
		abnormalParameters.hemoglobin.status === "low"
	) {
		// Check MCV to determine type of anemia
		if (abnormalParameters.mcv && abnormalParameters.mcv.status === "low") {
			possibleConditions.push({
				name: "Anemia Mikrositik",
				description:
					"Anemia dengan sel darah merah yang lebih kecil dari normal.",
				probability: "Tinggi",
				recommendations: [
					"Konsultasikan dengan dokter untuk evaluasi lebih lanjut",
					"Tes kadar ferritin dan besi untuk memeriksa anemia defisiensi besi",
					"Pertimbangkan suplemen besi jika direkomendasikan oleh dokter",
				],
			});
		} else if (
			abnormalParameters.mcv &&
			abnormalParameters.mcv.status === "high"
		) {
			possibleConditions.push({
				name: "Anemia Makrositik",
				description:
					"Anemia dengan sel darah merah yang lebih besar dari normal, sering dikaitkan dengan defisiensi vitamin B12 atau asam folat.",
				probability: "Tinggi",
				recommendations: [
					"Konsultasikan dengan dokter untuk evaluasi lebih lanjut",
					"Tes kadar vitamin B12 dan asam folat",
					"Evaluasi fungsi tiroid",
				],
			});
		} else {
			possibleConditions.push({
				name: "Anemia Normositik",
				description:
					"Anemia dengan ukuran sel darah merah normal, bisa disebabkan oleh penyakit kronis atau kehilangan darah.",
				probability: "Sedang",
				recommendations: [
					"Konsultasikan dengan dokter untuk evaluasi lebih lanjut",
					"Periksa adanya sumber perdarahan",
					"Evaluasi fungsi ginjal dan hati",
				],
			});
		}
	}

	// Rule 2: Polycythemia (high hemoglobin and hematocrit)
	if (
		abnormalParameters.hemoglobin &&
		abnormalParameters.hemoglobin.status === "high" &&
		abnormalParameters.hematocrit &&
		abnormalParameters.hematocrit.status === "high"
	) {
		possibleConditions.push({
			name: "Polisitemia",
			description:
				"Kondisi dimana tubuh memproduksi terlalu banyak sel darah merah, menyebabkan darah menjadi lebih kental.",
			probability: "Tinggi",
			recommendations: [
				"Segera konsultasikan dengan hematologis",
				"Pertimbangkan tes JAK2 untuk polisitemia vera",
				"Evaluasi saturasi oksigen untuk memeriksa penyebab sekunder",
			],
		});
	}

	// Rule 3: Leukocytosis (high white blood cells)
	if (
		abnormalParameters.leukocytes &&
		abnormalParameters.leukocytes.status === "high"
	) {
		possibleConditions.push({
			name: "Leukositosis",
			description:
				"Peningkatan jumlah sel darah putih, sering kali mengindikasikan infeksi atau peradangan.",
			probability: "Tinggi",
			recommendations: [
				"Evaluasi adanya sumber infeksi",
				"Pemeriksaan diferensial leukosit",
				"Pertimbangkan tes CRP atau laju endap darah",
			],
		});
	}

	// Rule 4: Leukopenia (low white blood cells)
	if (
		abnormalParameters.leukocytes &&
		abnormalParameters.leukocytes.status === "low"
	) {
		possibleConditions.push({
			name: "Leukopenia",
			description:
				"Penurunan jumlah sel darah putih, bisa mengindikasikan masalah dengan sumsum tulang atau autoimun.",
			probability: "Tinggi",
			recommendations: [
				"Konsultasikan dengan hematologis",
				"Evaluasi riwayat obat-obatan",
				"Tes autoimun sesuai rekomendasi dokter",
			],
		});
	}

	// Rule 5: Thrombocytopenia (low platelets)
	if (
		abnormalParameters.thrombocytes &&
		abnormalParameters.thrombocytes.status === "low"
	) {
		possibleConditions.push({
			name: "Trombositopenia",
			description:
				"Penurunan jumlah trombosit/keping darah, yang bisa meningkatkan risiko perdarahan.",
			probability: "Tinggi",
			recommendations: [
				"Pantau tanda-tanda perdarahan",
				"Konsultasikan dengan hematologis",
				"Evaluasi kemungkinan penyebab seperti obat-obatan atau infeksi",
			],
		});
	}

	// Rule 6: Thrombocytosis (high platelets)
	if (
		abnormalParameters.thrombocytes &&
		abnormalParameters.thrombocytes.status === "high"
	) {
		possibleConditions.push({
			name: "Trombositosis",
			description:
				"Peningkatan jumlah trombosit/keping darah, bisa reaktif atau disebabkan oleh gangguan sumsum tulang.",
			probability: "Sedang",
			recommendations: [
				"Evaluasi penyebab peradangan atau infeksi",
				"Pertimbangkan pemeriksaan sumsum tulang jika persisten",
				"Pantau untuk gejala pembekuan darah",
			],
		});
	}

	// If no conditions detected but abnormal parameters exist
	if (
		possibleConditions.length === 0 &&
		Object.keys(abnormalParameters).length > 0
	) {
		possibleConditions.push({
			name: "Abnormalitas Darah Non-spesifik",
			description:
				"Parameter darah abnormal terdeteksi tetapi tidak cocok dengan pola penyakit spesifik.",
			probability: "Rendah",
			recommendations: [
				"Ulangi tes dalam 2-4 minggu untuk konfirmasi",
				"Konsultasikan dengan dokter jika gejala muncul",
				"Pertimbangkan evaluasi lebih lanjut jika hasil tetap abnormal",
			],
		});
	}

	// If all parameters are normal
	if (Object.keys(abnormalParameters).length === 0) {
		possibleConditions.push({
			name: "Hasil Normal",
			description: "Semua parameter darah berada dalam rentang normal.",
			probability: "Tinggi",
			recommendations: [
				"Lanjutkan pemeriksaan rutin sesuai rekomendasi dokter",
				"Pertahankan gaya hidup sehat",
				"Lakukan tes ulang dalam 6-12 bulan",
			],
		});
	}

	return possibleConditions;
};

// Main function to analyze blood test data
exports.analyzeBloodTest = (bloodTest) => {
	try {
		// Validasi input data
		if (!bloodTest) {
			throw new Error("Blood test data is missing");
		}

		console.log(
			"Received blood test data:",
			JSON.stringify(bloodTest, null, 2)
		);

		// Extract parameters from blood test with safety checks
		const parameters = {
			hemoglobin:
				bloodTest.hemoglobin !== undefined
					? parseFloat(bloodTest.hemoglobin)
					: null,
			hematocrit:
				bloodTest.hematocrit !== undefined
					? parseFloat(bloodTest.hematocrit)
					: null,
			erythrocytes:
				bloodTest.erythrocytes !== undefined
					? parseFloat(bloodTest.erythrocytes)
					: null,
			leukocytes:
				bloodTest.leukocytes !== undefined
					? parseFloat(bloodTest.leukocytes)
					: null,
			thrombocytes:
				bloodTest.thrombocytes !== undefined
					? parseFloat(bloodTest.thrombocytes)
					: null,
			mcv: bloodTest.mcv !== undefined ? parseFloat(bloodTest.mcv) : null,
			mch: bloodTest.mch !== undefined ? parseFloat(bloodTest.mch) : null,
			mchc: bloodTest.mchc !== undefined ? parseFloat(bloodTest.mchc) : null,
		};

		console.log("Processed parameters:", parameters);

		// Default gender and age if missing
		const patientData = {
			gender: bloodTest.patient_gender || "male",
			age: bloodTest.patient_age ? parseInt(bloodTest.patient_age) : 30,
		};

		console.log("Patient data:", patientData);

		// Get normal ranges based on gender
		const normalRanges = getNormalRanges(patientData.gender);

		// Identify abnormal parameters
		const abnormalParameters = identifyAbnormalParameters(
			parameters,
			normalRanges
		);
		console.log("Abnormal parameters:", abnormalParameters);

		// Apply rules to identify possible conditions
		const possibleConditions = applyRules(abnormalParameters, patientData);
		console.log("Possible conditions:", possibleConditions);

		// Return detection result
		return {
			testId: bloodTest.id,
			patientName: bloodTest.patient_name || "Unknown",
			patientAge: patientData.age,
			patientGender: patientData.gender,
			detectionDate: new Date().toLocaleDateString("id-ID", {
				day: "numeric",
				month: "long",
				year: "numeric",
			}),
			abnormalParameters,
			possibleConditions,
		};
	} catch (error) {
		console.error("Expert system error:", error);
		// Return a safe default result
		return {
			testId: bloodTest?.id || 0,
			patientName: bloodTest?.patient_name || "Unknown",
			patientAge: bloodTest?.patient_age || 0,
			patientGender: bloodTest?.patient_gender || "unknown",
			detectionDate: new Date().toLocaleDateString("id-ID", {
				day: "numeric",
				month: "long",
				year: "numeric",
			}),
			abnormalParameters: {},
			possibleConditions: [
				{
					name: "Error Analisis",
					description:
						"Terjadi kesalahan saat menganalisis data: " + error.message,
					probability: "Rendah",
					recommendations: [
						"Coba lagi dengan data yang valid",
						"Hubungi administrator sistem",
					],
				},
			],
		};
	}
};
