const express = require("express");
const router = express.Router();
const {
  transferMoney,
  getTransactions,
  getTransactionById,
} = require("../controllers/transactionController");

router.post("/transfer", transferMoney);
router.get("/", getTransactions);
router.get("/:id", getTransactionById);

module.exports = router;
