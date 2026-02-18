const express = require("express");
const router = express.Router();
const authController = require("../controllers/authControllers");

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post('/kakao', authController.login);
router.post('/signup-complete', authController.completeSignup);

module.exports = router;
