const Customer = require("../models/Customer");
const Account = require("../models/Account");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/customers?search=
const getCustomers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};

  if (search) {
    const term = search.trim();
    filter.$or = [
      { fullName: { $regex: term, $options: "i" } },
      { email: { $regex: term, $options: "i" } },
      { phone: { $regex: term, $options: "i" } },
    ];
  }

  const customers = await Customer.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: customers });
});

// GET /api/customers/:id  -> includes the customer's accounts
const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  const accounts = await Account.find({ customer: customer._id });

  res.status(200).json({ success: true, data: { ...customer.toObject(), accounts } });
});

// POST /api/customers
const createCustomer = asyncHandler(async (req, res) => {
  const { fullName, email, phone } = req.body;
  const customer = await Customer.create({ fullName, email, phone });
  res.status(201).json({ success: true, message: "Customer created successfully", data: customer });
});

// PUT /api/customers/:id
const updateCustomer = asyncHandler(async (req, res) => {
  const { fullName, email, phone } = req.body;

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { fullName, email, phone },
    { new: true, runValidators: true }
  );

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  res.status(200).json({ success: true, message: "Customer updated successfully", data: customer });
});

// DELETE /api/customers/:id
const deleteCustomer = asyncHandler(async (req, res) => {
  const linkedAccounts = await Account.countDocuments({ customer: req.params.id });
  if (linkedAccounts > 0) {
    throw new ApiError(
      400,
      "This customer still has bank accounts linked to them. Delete or reassign those accounts first."
    );
  }

  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  res.status(200).json({ success: true, message: "Customer deleted successfully" });
});

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
