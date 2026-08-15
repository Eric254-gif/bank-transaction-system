const Customer = require("../models/Customer");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/dashboard/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalCustomers, totalAccounts, totalTransactions, successfulTransactions, failedTransactions, balanceAgg, recentTransactions] =
    await Promise.all([
      Customer.countDocuments(),
      Account.countDocuments(),
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: "Completed" }),
      Transaction.countDocuments({ status: { $in: ["Failed", "Rolled Back"] } }),
      Account.aggregate([{ $group: { _id: null, total: { $sum: "$balance" } } }]),
      Transaction.find()
        .sort({ transactionDate: -1 })
        .limit(5)
        .populate({
          path: "fromAccount",
          select: "accountNumber customer",
          populate: { path: "customer", select: "fullName" },
        })
        .populate({
          path: "toAccount",
          select: "accountNumber customer",
          populate: { path: "customer", select: "fullName" },
        }),
    ]);

  const totalMoney = balanceAgg.length > 0 ? balanceAgg[0].total : 0;

  res.status(200).json({
    success: true,
    data: {
      totalCustomers,
      totalAccounts,
      totalMoney,
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      recentTransactions,
    },
  });
});

module.exports = { getDashboardStats };
