// config/db.js - Konfigurasi database MySQL dengan perbaikan tipe data kolom diagnosisData
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config();

// Konfigurasi koneksi database
const dbConfig = {
	host: process.env.DB_HOST || "localhost",
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || "",
	database: process.env.DB_NAME || "bloodaldo",
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
};

// Pool koneksi untuk penggunaan di seluruh aplikasi
const pool = mysql.createPool(dbConfig);

// Fungsi untuk mengecek koneksi database
const checkConnection = async () => {
	try {
		const connection = await pool.getConnection();
		console.log("Database connection established successfully");
		connection.release();
		return true;
	} catch (error) {
		console.error("Database connection failed:", error);
		return false;
	}
};

// Fungsi untuk inisialisasi database (membuat tabel jika belum ada)
const initDb = async () => {
	try {
		const connection = await pool.getConnection();

		console.log("Creating database tables if they do not exist...");

		// Membuat tabel patients dengan diagnosisData sebagai TEXT
		await connection.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        gender ENUM('Laki-laki', 'Perempuan') NOT NULL,
        medicalHistory TEXT,
        hemoglobin FLOAT NOT NULL,
        redBloodCell FLOAT NOT NULL,
        whiteBloodCell FLOAT NOT NULL,
        platelet FLOAT NOT NULL,
        hematocrit FLOAT,
        mcv FLOAT,
        mch FLOAT,
        mchc FLOAT,
        neutrophils FLOAT,
        lymphocytes FLOAT,
        monocytes FLOAT,
        eosinophils FLOAT,
        basophils FLOAT,
        diagnosis VARCHAR(255),
        diagnosisData TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

		// Membuat tabel admin_users
		await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        fullName VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

		// Cek apakah sudah ada admin user
		const [adminUsers] = await connection.query("SELECT * FROM admin_users");

		// Jika belum ada admin user, buat admin default
		if (adminUsers.length === 0) {
			const hashedPassword = await bcrypt.hash("admin123", 10);

			await connection.query(
				`
        INSERT INTO admin_users (username, password, fullName)
        VALUES ('admin', ?, 'Administrator')
      `,
				[hashedPassword]
			);

			console.log(
				"Default admin user created (username: admin, password: admin123)"
			);
		}

		// Verifikasi tipe data kolom diagnosisData
		try {
			const [columns] = await connection.query(
				`
        SELECT COLUMN_NAME, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'diagnosisData'
      `,
				[dbConfig.database]
			);

			if (columns.length > 0) {
				const dataType = columns[0].DATA_TYPE.toLowerCase();
				console.log(`Column 'diagnosisData' has data type: ${dataType}`);

				// Jika tipe data bukan TEXT atau JSON, ubah tipe data
				if (dataType !== "text" && dataType !== "json") {
					console.log("Altering column diagnosisData to TEXT type...");
					await connection.query(`
            ALTER TABLE patients 
            MODIFY COLUMN diagnosisData TEXT
          `);
					console.log("Column diagnosisData altered successfully");
				}
			}
		} catch (error) {
			console.error("Error checking column data type:", error);
		}

		connection.release();
		console.log("Database initialized successfully");
		return true;
	} catch (error) {
		console.error("Database initialization failed:", error);
		throw error;
	}
};

module.exports = {
	pool,
	checkConnection,
	initDb,
};
