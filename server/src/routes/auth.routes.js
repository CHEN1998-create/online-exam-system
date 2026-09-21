const express = require("express");
const authController = require("../controllers/auth.controller");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// POST /api/auth/login
router.post("/login", authController.login);
// GET /api/auth/me
router.get("/me", authenticate, authController.me);

module.exports = router;
