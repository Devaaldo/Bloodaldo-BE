// server.js - Entry point untuk aplikasi backend Bloodaldo
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Import middlewares
const { errorHandler } = require("./middlewares/errorMiddleware");

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

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

// Initialize database
const { initDb } = require("./config/db");

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
