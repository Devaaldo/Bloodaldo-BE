require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// Import routes
const authRoutes = require("./routes/authRoutes");
const bloodTestRoutes = require("./routes/bloodTestRoutes");
const detectionRoutes = require("./routes/detectionRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for reports/exports)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/blood-tests", bloodTestRoutes);
app.use("/api/detection", detectionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

// Basic route for testing
app.get("/", (req, res) => {
	res.json({ message: "Welcome to Bloodaldo API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		message: "Something went wrong!",
		error:
			process.env.NODE_ENV === "development"
				? err.message
				: "Internal Server Error",
	});
});

// Start server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
