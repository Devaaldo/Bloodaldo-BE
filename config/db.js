const mysql = require("mysql2/promise");
require("dotenv").config();

// Create connection pool
const pool = mysql.createPool({
	host: process.env.DB_HOST || "localhost",
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || "sql123",
	database: process.env.DB_NAME || "bloodaldo",
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

// Test connection
const testConnection = async () => {
	try {
		const connection = await pool.getConnection();
		console.log("Database connection established successfully");
		connection.release();
	} catch (err) {
		console.error("Error connecting to database:", err);
		process.exit(1);
	}
};

testConnection();

module.exports = pool;
