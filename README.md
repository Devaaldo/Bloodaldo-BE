# Bloodaldo Backend

![Bloodaldo Logo](public/logo.png)

## 📋 Deskripsi Proyek

Backend untuk aplikasi Bloodaldo, sistem pakar untuk deteksi dini penyakit melalui analisis data bank darah. API ini menyediakan endpoints untuk manajemen data pasien, analisis darah, autentikasi, dan ekspor data.

## 🛠️ Teknologi yang Digunakan

- **Node.js** sebagai runtime environment
- **Express.js** sebagai framework web
- **MySQL** sebagai database
- **Sequelize** sebagai ORM (Object-Relational Mapping)
- **JSON Web Token (JWT)** untuk autentikasi
- **Multer** untuk handling file upload
- **PDFKit** untuk generasi file PDF
- **CSV-Writer** untuk generasi file CSV
- **Nodemailer** (opsional) untuk notifikasi email

## ⚙️ Instalasi dan Setup

1. Clone repository
```bash
git clone https://github.com/username/bloodaldo-backend.git
cd bloodaldo-backend
```

2. Install dependencies
```bash
npm install
```

3. Setup database
```bash
# Pastikan MySQL sudah terinstall dan berjalan
mysql -u root -p
```

```sql
CREATE DATABASE bloodaldo_db;
CREATE USER 'bloodaldo_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON bloodaldo_db.* TO 'bloodaldo_user'@'localhost';
FLUSH PRIVILEGES;
```

4. Konfigurasi environment variables
```bash
cp .env.example .env
```
Edit file `.env` dan sesuaikan dengan konfigurasi database

5. Migrasi database
```bash
npx sequelize-cli db:migrate
```

6. Seed data awal (opsional)
```bash
npx sequelize-cli db:seed:all
```

7. Jalankan server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📁 Struktur Proyek

```
bloodaldo-backend/
├── public/
│   ├── logo.png
│   └── ...
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── index.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   ├── diagnosisController.js
│   │   ├── reportController.js
│   │   └── expertSystemController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── models/
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── Patient.js
│   │   ├── BloodTest.js
│   │   ├── Diagnosis.js
│   │   └── Disease.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── authRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── diagnosisRoutes.js
│   │   └── reportRoutes.js
│   ├── services/
│   │   ├── expertSystem.js
│   │   ├── pdfGenerator.js
│   │   └── csvGenerator.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── validator.js
│   │   └── helpers.js
│   └── index.js
├── .env.example
├── .eslintrc.js
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## 🌐 API Endpoints

### Autentikasi

```
POST /api/auth/register - Registrasi user baru
POST /api/auth/login - Login user
GET /api/auth/profile - Informasi user terautentikasi
PUT /api/auth/profile - Update profil user
POST /api/auth/logout - Logout user
```

### Pasien

```
GET /api/patients - Daftar semua pasien
GET /api/patients/:id - Detail pasien spesifik
POST /api/patients - Tambah pasien baru
PUT /api/patients/:id - Update data pasien
DELETE /api/patients/:id - Hapus data pasien
```

### Tes Darah & Diagnosis

```
POST /api/blood-tests - Menambahkan hasil tes darah
GET /api/blood-tests/:id - Mendapatkan detail tes darah
POST /api/diagnosis - Melakukan diagnosa berdasarkan tes darah
GET /api/diagnosis - Mendapatkan semua riwayat diagnosa
GET /api/diagnosis/:id - Mendapatkan detail diagnosa spesifik
```

### Laporan & Ekspor

```
GET /api/reports/stats - Mendapatkan statistik diagnosis
GET /api/reports/export/csv - Mengekspor data ke format CSV
GET /api/reports/export/pdf - Mengekspor data ke format PDF
```

## 📊 Skema Database

### Tabel `users`
- `id` (Primary Key)
- `username`
- `email`
- `password` (hashed)
- `role` (admin/user)
- `created_at`
- `updated_at`

### Tabel `patients`
- `id` (Primary Key)
- `name`
- `age`
- `gender`
- `medical_history`
- `notes`
- `created_at`
- `updated_at`

### Tabel `blood_tests`
- `id` (Primary Key)
- `patient_id` (Foreign Key ke `patients.id`)
- `hemoglobin` (HB)
- `red_blood_cells` (RBC)
- `white_blood_cells` (WBC)
- `platelets`
- `hematocrit`
- `neutrophils`
- `lymphocytes`
- `monocytes`
- `eosinophils`
- `basophils`
- `test_date`
- `created_at`
- `updated_at`

### Tabel `diagnoses`
- `id` (Primary Key)
- `patient_id` (Foreign Key ke `patients.id`)
- `blood_test_id` (Foreign Key ke `blood_tests.id`)
- `disease_id` (Foreign Key ke `diseases.id`)
- `confidence` (level kepercayaan diagnosa)
- `notes`
- `created_at`
- `updated_at`

### Tabel `diseases`
- `id` (Primary Key)
- `name` (nama penyakit)
- `description`
- `symptoms`
- `created_at`
- `updated_at`

## 🧠 Implementasi Sistem Pakar

Backend menyediakan implementasi sistem pakar menggunakan kombinasi pendekatan:

1. **Rule-Based System**:
   - Aturan diimplementasikan dalam file `services/expertSystem.js`
   - Contoh aturan: "IF hemoglobin < 13.5 AND red_blood_cells < 4.7 THEN anemia"
   - Setiap aturan memiliki weight/confidence untuk diagnosa yang lebih akurat

2. **Decision Tree**:
   - Implementasi pohon keputusan di `services/expertSystem.js`
   - Menggunakan parameter tes darah untuk mengarahkan klasifikasi penyakit
   - Hasil berupa diagnosa dengan confidence level

## 🔒 Keamanan

- Implementasi autentikasi JWT
- Password hashing dengan bcrypt
- Validasi input pada semua endpoint
- Rate limiting untuk mencegah serangan brute force
- Implementasi CORS untuk mengontrol akses

## 🚀 Deployment

Instruksi untuk deploy ke production:

1. Setup server (misalnya AWS EC2, DigitalOcean Droplet)
2. Install Node.js, MySQL
3. Clone repository
4. Setup database dan environment variables
5. Install PM2 untuk process management
```bash
npm install -g pm2
pm2 start server.js --name bloodaldo-api
```

## 🤝 Kontribusi

Kontribusi sangat diterima! Untuk berkontribusi:

1. Fork repository
2. Buat branch baru (`git checkout -b feature/fitur-baru`)
3. Commit perubahan (`git commit -m 'Menambahkan fitur baru'`)
4. Push ke branch (`git push origin feature/fitur-baru`)
5. Buat Pull Request
