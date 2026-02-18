const express = require("express");
const router = express.Router();
const matchController = require("../controllers/matchController");

// 분석 시작 시 매칭권 차감 API
router.post("/match/use", matchController.useMatchTicket);

module.exports = router;
