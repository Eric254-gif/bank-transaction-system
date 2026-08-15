const mongoose = require("mongoose");

// An Account belongs to a Customer and holds a money balance.
// Balances are stored in whole cents-free units (KSh) as Numbers for
// simplicity, which is fine for an academic demo project.
const accountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: [true, "Account number is required"],
      unique: true,
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "An account must belong to a customer"],
    },
    accountType: {
      type: String,
      enum: {
        values: ["Savings", "Current"],
        message: "Account type must be either Savings or Current",
      },
      required: [true, "Account type is required"],
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Account balance cannot be negative"],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("Account", accountSchema);
