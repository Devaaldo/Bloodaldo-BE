const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Update current user profile
router.put("/profile", userController.updateProfile);

// Change password
router.put("/change-password", userController.changePassword);

// Admin routes - require admin role
router.get("/all", roleMiddleware("admin"), userController.getAllUsers);
router.put("/:id", roleMiddleware("admin"), userController.updateUser);
router.delete("/:id", roleMiddleware("admin"), userController.deleteUser);

module.exports = router;
