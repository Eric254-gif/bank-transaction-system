const mongoose = require("mongoose");

// A Transaction is a permanent record of a money transfer between two
// Accounts. It is created inside the same MongoDB session/transaction as
// the balance updates, so it is only ever saved if the whole transfer
// succeeded (Atomicity).
const transactionSchema = new mongoose.Schema(
  {
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Transaction amount must be greater than zero"],
    },
    status: {
      type: String,
      enum: ["Completed", "Failed", "Rolled Back"],
      default: "Completed",
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
