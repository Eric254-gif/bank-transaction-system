const mongoose = require("mongoose");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * POST /api/transactions/transfer
 *
 * This is the heart of the whole project: a money transfer performed as a
 * single MongoDB multi-document ACID transaction using a Mongoose session.
 *
 * Every read and write below is passed the SAME session. That is what
 * makes them part of one atomic unit: either every operation is applied
 * (commitTransaction) or none of them are (abortTransaction) — there is
 * no possible in-between state where the sender loses money but the
 * receiver never gets it.
 */
const transferMoney = asyncHandler(async (req, res) => {
  const { fromAccount, toAccount, amount, description } = req.body;

  // ---- Basic request validation (before we even open a session) ----
  if (!fromAccount || !toAccount) {
    throw new ApiError(400, "Both fromAccount and toAccount are required");
  }
  if (fromAccount === toAccount) {
    throw new ApiError(400, "Sender and receiver accounts must be different");
  }
  const transferAmount = Number(amount);
  if (!transferAmount || transferAmount <= 0) {
    throw new ApiError(400, "Transfer amount must be greater than zero");
  }

  // startSession() opens a client session. A transaction is then run
  // inside that session with startTransaction().
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // ---- 1. Validate sender ----
    // .session(session) ties this read to the transaction so it sees a
    // consistent snapshot of the data.
    const sender = await Account.findById(fromAccount).session(session);
    if (!sender) {
      throw new ApiError(404, "Sender account not found");
    }

    // ---- 2. Validate receiver ----
    const receiver = await Account.findById(toAccount).session(session);
    if (!receiver) {
      throw new ApiError(404, "Receiver account not found");
    }

    // ---- 3. Check sufficient balance ----
    if (sender.balance < transferAmount) {
      throw new ApiError(400, "Insufficient account balance");
    }

    // ---- 4. Deduct money from sender ----
    sender.balance -= transferAmount;
    await sender.save({ session });

    // ---- 5. Add money to receiver ----
    receiver.balance += transferAmount;
    await receiver.save({ session });

    // ---- 6. Create transaction record ----
    const [transactionRecord] = await Transaction.create(
      [
        {
          fromAccount: sender._id,
          toAccount: receiver._id,
          amount: transferAmount,
          status: "Completed",
          description: description || "",
        },
      ],
      { session }
    );

    // ---- 7. Commit transaction ----
    // Nothing is actually persisted until this line runs successfully.
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Transaction completed successfully",
      data: transactionRecord,
    });
  } catch (error) {
    // Any failure above (validation, insufficient funds, DB error) lands
    // here. Aborting throws away every write made inside this session,
    // so the sender and receiver balances are exactly as they were
    // before the request started.
    await session.abortTransaction();

    // Record the failed attempt as its own (non-transactional) audit log
    // entry so it shows up in Transaction History / Dashboard stats.
    // This insert happens OUTSIDE the aborted session, on purpose - it is
    // an audit record of the attempt, not part of the money movement.
    try {
      await Transaction.create({
        fromAccount: fromAccount && mongoose.isValidObjectId(fromAccount) ? fromAccount : undefined,
        toAccount: toAccount && mongoose.isValidObjectId(toAccount) ? toAccount : undefined,
        amount: Number(amount) || 0,
        status: "Failed",
        description: description || "",
      });
    } catch (logError) {
      // If even the audit log fails (e.g. bad ids), don't hide the
      // original error behind a logging error.
      console.error("Failed to log failed transaction:", logError.message);
    }

    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Transaction failed and was rolled back",
    });
  } finally {
    // Always release the session's resources, whether we committed or aborted.
    session.endSession();
  }
});

/**
 * GET /api/transactions
 * Supports optional query filters: status, search (by account number),
 * startDate, endDate, page, limit.
 */
const getTransactions = asyncHandler(async (req, res) => {
  const { status, search, startDate, endDate, page = 1, limit = 10 } = req.query;

  const filter = {};

  if (status && status !== "All") {
    filter.status = status;
  }

  if (startDate || endDate) {
    filter.transactionDate = {};
    if (startDate) filter.transactionDate.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.transactionDate.$lte = end;
    }
  }

  // Populate account + customer info so the frontend can show names,
  // not just raw ObjectIds.
  let query = Transaction.find(filter)
    .populate({
      path: "fromAccount",
      select: "accountNumber customer",
      populate: { path: "customer", select: "fullName" },
    })
    .populate({
      path: "toAccount",
      select: "accountNumber customer",
      populate: { path: "customer", select: "fullName" },
    })
    .sort({ transactionDate: -1 });

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

  let transactions = await query;

  // Simple text search across account numbers / customer names /
  // description, done in-memory after populate for simplicity since this
  // is an academic-scale dataset.
  if (search) {
    const term = search.toLowerCase();
    transactions = transactions.filter((t) => {
      const fromNum = t.fromAccount?.accountNumber?.toLowerCase() || "";
      const toNum = t.toAccount?.accountNumber?.toLowerCase() || "";
      const fromName = t.fromAccount?.customer?.fullName?.toLowerCase() || "";
      const toName = t.toAccount?.customer?.fullName?.toLowerCase() || "";
      const desc = t.description?.toLowerCase() || "";
      return (
        fromNum.includes(term) ||
        toNum.includes(term) ||
        fromName.includes(term) ||
        toName.includes(term) ||
        desc.includes(term)
      );
    });
  }

  const total = transactions.length;
  const start = (pageNum - 1) * limitNum;
  const paginated = transactions.slice(start, start + limitNum);

  res.status(200).json({
    success: true,
    data: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
});

/**
 * GET /api/transactions/:id
 */
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate({
      path: "fromAccount",
      select: "accountNumber customer",
      populate: { path: "customer", select: "fullName email" },
    })
    .populate({
      path: "toAccount",
      select: "accountNumber customer",
      populate: { path: "customer", select: "fullName email" },
    });

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  res.status(200).json({ success: true, data: transaction });
});

module.exports = { transferMoney, getTransactions, getTransactionById };
