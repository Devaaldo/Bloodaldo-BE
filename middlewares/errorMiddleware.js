// middlewares/errorMiddleware.js - Middleware untuk penanganan error
const errorHandler = (err, req, res, next) => {
	console.error("Error:", err);

	// Status code default adalah 500 (Internal Server Error)
	const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

	res.status(statusCode).json({
		success: false,
		message: err.message || "Terjadi kesalahan pada server",
		stack: process.env.NODE_ENV === "production" ? null : err.stack,
	});
};

module.exports = {
	errorHandler,
};
