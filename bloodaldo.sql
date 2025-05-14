-- Buat database
CREATE DATABASE bloodaldo;
USE bloodaldo;

-- Tabel Pengguna
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Tabel Data Tes Darah
CREATE TABLE blood_tests (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_age INT NOT NULL,
  patient_gender ENUM('male', 'female') NOT NULL,
  hemoglobin FLOAT,
  hematocrit FLOAT,
  erythrocytes FLOAT,
  leukocytes FLOAT,
  thrombocytes FLOAT,
  mcv FLOAT,
  mch FLOAT,
  mchc FLOAT,
  notes TEXT,
  test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel Hasil Deteksi
CREATE TABLE detection_results (
  id INT NOT NULL AUTO_INCREMENT,
  blood_test_id INT NOT NULL,
  detection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  abnormal_parameters JSON,
  possible_conditions JSON,
  analysis_time VARCHAR(50),
  PRIMARY KEY (id),
  FOREIGN KEY (blood_test_id) REFERENCES blood_tests(id) ON DELETE CASCADE
);

-- Tabel Aturan Sistem Pakar
CREATE TABLE rules (
  id INT NOT NULL AUTO_INCREMENT,
  rule_name VARCHAR(255) NOT NULL,
  condition JSON NOT NULL,
  conclusion VARCHAR(255) NOT NULL,
  description TEXT,
  probability ENUM('Rendah', 'Sedang', 'Tinggi') DEFAULT 'Sedang',
  recommendations JSON,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Masukkan data awal untuk admin
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@bloodaldo.com', '$2b$10$qiMxXEVfRpHMQWRBqUxXV.LRcmYP5ClsXVmGS6a5xTSgJdUk8.bii', 'admin');
-- Password: admin123 (dienkripsi dengan bcrypt)

-- Masukkan data awal untuk aturan sistem pakar
INSERT INTO rules (rule_name, condition, conclusion, description, probability, recommendations) VALUES
('Anemia Mikrositik', '{"hemoglobin": {"status": "low"}, "mcv": {"status": "low"}}', 'Anemia Mikrositik', 'Anemia dengan sel darah merah yang lebih kecil dari normal.', 'Tinggi', '["Konsultasikan dengan dokter untuk evaluasi lebih lanjut", "Tes kadar ferritin dan besi untuk memeriksa anemia defisiensi besi", "Pertimbangkan suplemen besi jika direkomendasikan oleh dokter"]'),
('Anemia Makrositik', '{"hemoglobin": {"status": "low"}, "mcv": {"status": "high"}}', 'Anemia Makrositik', 'Anemia dengan sel darah merah yang lebih besar dari normal, sering dikaitkan dengan defisiensi vitamin B12 atau asam folat.', 'Tinggi', '["Konsultasikan dengan dokter untuk evaluasi lebih lanjut", "Tes kadar vitamin B12 dan asam folat", "Evaluasi fungsi tiroid"]'),
('Anemia Normositik', '{"hemoglobin": {"status": "low"}, "mcv": {"status": "normal"}}', 'Anemia Normositik', 'Anemia dengan ukuran sel darah merah normal, bisa disebabkan oleh penyakit kronis atau kehilangan darah.', 'Sedang', '["Konsultasikan dengan dokter untuk evaluasi lebih lanjut", "Periksa adanya sumber perdarahan", "Evaluasi fungsi ginjal dan hati"]'),
('Polisitemia', '{"hemoglobin": {"status": "high"}, "hematocrit": {"status": "high"}}', 'Polisitemia', 'Kondisi dimana tubuh memproduksi terlalu banyak sel darah merah, menyebabkan darah menjadi lebih kental.', 'Tinggi', '["Segera konsultasikan dengan hematologis", "Pertimbangkan tes JAK2 untuk polisitemia vera", "Evaluasi saturasi oksigen untuk memeriksa penyebab sekunder"]'),
('Leukositosis', '{"leukocytes": {"status": "high"}}', 'Leukositosis', 'Peningkatan jumlah sel darah putih, sering kali mengindikasikan infeksi atau peradangan.', 'Tinggi', '["Evaluasi adanya sumber infeksi", "Pemeriksaan diferensial leukosit", "Pertimbangkan tes CRP atau laju endap darah"]'),
('Leukopenia', '{"leukocytes": {"status": "low"}}', 'Leukopenia', 'Penurunan jumlah sel darah putih, bisa mengindikasikan masalah dengan sumsum tulang atau autoimun.', 'Tinggi', '["Konsultasikan dengan hematologis", "Evaluasi riwayat obat-obatan", "Tes autoimun sesuai rekomendasi dokter"]'),
('Trombositopenia', '{"thrombocytes": {"status": "low"}}', 'Trombositopenia', 'Penurunan jumlah trombosit/keping darah, yang bisa meningkatkan risiko perdarahan.', 'Tinggi', '["Pantau tanda-tanda perdarahan", "Konsultasikan dengan hematologis", "Evaluasi kemungkinan penyebab seperti obat-obatan atau infeksi"]'),
('Trombositosis', '{"thrombocytes": {"status": "high"}}', 'Trombositosis', 'Peningkatan jumlah trombosit/keping darah, bisa reaktif atau disebabkan oleh gangguan sumsum tulang.', 'Sedang', '["Evaluasi penyebab peradangan atau infeksi", "Pertimbangkan pemeriksaan sumsum tulang jika persisten", "Pantau untuk gejala pembekuan darah"]');

-- Tambahkan data contoh pengguna
INSERT INTO users (name, email, password, role) VALUES 
('Budi Santoso', 'budi@example.com', '$2b$10$qiMxXEVfRpHMQWRBqUxXV.LRcmYP5ClsXVmGS6a5xTSgJdUk8.bii', 'user'),
('Siti Rahayu', 'siti@example.com', '$2b$10$qiMxXEVfRpHMQWRBqUxXV.LRcmYP5ClsXVmGS6a5xTSgJdUk8.bii', 'user');
-- Password: admin123 (dienkripsi dengan bcrypt)

-- Tambahkan data contoh tes darah
INSERT INTO blood_tests (user_id, patient_name, patient_age, patient_gender, hemoglobin, hematocrit, erythrocytes, leukocytes, thrombocytes, mcv, mch, mchc, notes, test_date) VALUES
(2, 'Budi Santoso', 35, 'male', 14.5, 45, 5.2, 7500, 250000, 88, 29, 33, 'Pasien mengeluh mudah lelah', '2025-05-10 09:30:00'),
(2, 'Budi Santoso', 35, 'male', 14.2, 44, 5.1, 8000, 245000, 87, 28, 32, 'Pemeriksaan rutin', '2025-04-15 10:15:00'),
(3, 'Siti Rahayu', 28, 'female', 11.2, 34, 4.0, 9200, 300000, 75, 25, 31, 'Pasien mengeluh pusing', '2025-05-08 14:45:00');

-- Tambahkan data contoh hasil deteksi
INSERT INTO detection_results (blood_test_id, detection_date, abnormal_parameters, possible_conditions, analysis_time) VALUES
(1, '2025-05-10 09:35:00', '{}', '[{"name":"Hasil Normal","description":"Semua parameter darah berada dalam rentang normal.","probability":"Tinggi","recommendations":["Lanjutkan pemeriksaan rutin sesuai rekomendasi dokter","Pertahankan gaya hidup sehat","Lakukan tes ulang dalam 6-12 bulan"]}]', '0.6 detik'),
(2, '2025-04-15 10:20:00', '{}', '[{"name":"Hasil Normal","description":"Semua parameter darah berada dalam rentang normal.","probability":"Tinggi","recommendations":["Lanjutkan pemeriksaan rutin sesuai rekomendasi dokter","Pertahankan gaya hidup sehat","Lakukan tes ulang dalam 6-12 bulan"]}]', '0.5 detik'),
(3, '2025-05-08 14:50:00', '{"hemoglobin":{"value":11.2,"status":"low","normalRange":"12.0 - 15.5"},"hematocrit":{"value":34,"status":"low","normalRange":"36 - 44"},"mcv":{"value":75,"status":"low","normalRange":"80 - 96"}}', '[{"name":"Anemia Mikrositik","description":"Anemia dengan sel darah merah yang lebih kecil dari normal.","probability":"Tinggi","recommendations":["Konsultasikan dengan dokter untuk evaluasi lebih lanjut","Tes kadar ferritin dan besi untuk memeriksa anemia defisiensi besi","Pertimbangkan suplemen besi jika direkomendasikan oleh dokter"]}]', '0.7 detik');