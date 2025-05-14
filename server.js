// server.js - Entry point untuk aplikasi backend Bloodaldo
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Buat folder temp jika belum ada
const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) {
	fs.mkdirSync(tempDir, { recursive: true });
}

// Initialize database before importing routes
const { initDb } = require("./config/db");

// Import routes setelah database diinisialisasi
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Import middlewares
const { errorHandler } = require("./middlewares/errorMiddleware");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/reports", reportRoutes);

// Default route
app.get("/", (req, res) => {
	res.json({ message: "Welcome to Bloodaldo API" });
});

// Error handling middleware
app.use(errorHandler);

const startServer = async () => {
	try {
		await initDb();
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

startServer();
