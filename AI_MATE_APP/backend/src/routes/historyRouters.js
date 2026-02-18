const express = require("express");
const router = express.Router();
const historyController = require("../controllers/historyControllers");

router.post("/list", historyController.getHistories);
router.get("/detail/:id", historyController.getChatDetail);
router.delete("/:id", historyController.deleteHistory);

module.exports = router;
