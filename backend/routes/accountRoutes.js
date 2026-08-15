const express = require("express");
const router = express.Router();
const { getAccounts, getAccountById, createAccount } = require("../controllers/accountController");

router.route("/").get(getAccounts).post(createAccount);
router.route("/:id").get(getAccountById);

module.exports = router;
