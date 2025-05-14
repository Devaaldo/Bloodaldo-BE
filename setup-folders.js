#!/usr/bin/env node

/**
 * Script untuk memastikan semua folder yang diperlukan sudah dibuat
 */

const fs = require("fs");
const path = require("path");

const directories = [
	"config",
	"controllers",
	"middlewares",
	"models",
	"routes",
	"utils",
	"temp",
];

console.log("Creating necessary directories...");

directories.forEach((dir) => {
	const dirPath = path.join(__dirname, dir);
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
		console.log(`Created directory: ${dir}`);
	} else {
		console.log(`Directory already exists: ${dir}`);
	}
});

console.log("Done creating directories.");
