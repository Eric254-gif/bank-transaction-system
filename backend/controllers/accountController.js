const Account = require("../models/Account");
const Customer = require("../models/Customer");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/accounts?search=
const getAccounts = asyncHandler(async (req, res) => {
  const { search } = req.query;

  let accounts = await Account.find()
    .populate("customer", "fullName email phone")
    .sort({ createdAt: -1 });

  if (search) {
    const term = search.toLowerCase();
    accounts = accounts.filter(
      (a) =>
        a.accountNumber.toLowerCase().includes(term) ||
        a.customer?.fullName?.toLowerCase().includes(term)
    );
  }

  res.status(200).json({ success: true, data: accounts });
});

// GET /api/accounts/:id
const getAccountById = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id).populate("customer", "fullName email phone");
  if (!account) {
    throw new ApiError(404, "Account not found");
  }
  res.status(200).json({ success: true, data: account });
});

// POST /api/accounts
const createAccount = asyncHandler(async (req, res) => {
  const { accountNumber, customer, accountType, balance } = req.body;

  if (!accountNumber || !customer || !accountType) {
    throw new ApiError(400, "accountNumber, customer and accountType are required");
  }

  const customerExists = await Customer.findById(customer);
  if (!customerExists) {
    throw new ApiError(404, "Customer not found");
  }

  const initialBalance = Number(balance) || 0;
  if (initialBalance < 0) {
    throw new ApiError(400, "Initial balance cannot be negative");
  }

  const account = await Account.create({
    accountNumber: accountNumber.trim(),
    customer,
    accountType,
    balance: initialBalance,
  });

  const populated = await account.populate("customer", "fullName email phone");

  res.status(201).json({ success: true, message: "Account created successfully", data: populated });
});

module.exports = { getAccounts, getAccountById, createAccount };
