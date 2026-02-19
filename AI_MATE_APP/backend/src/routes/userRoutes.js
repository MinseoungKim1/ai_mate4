const express = require("express");
const router = express.Router();
const userController = require("../controllers/userControllers");

router.post("/status", userController.getStatus);
router.post("/match/use", userController.useMatch);
router.post("/match/ai/use", userController.useAiMatch);
router.post('/confirm', userController.confirmPayment);
module.exports = router;
