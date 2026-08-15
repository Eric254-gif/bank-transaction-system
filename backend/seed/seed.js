// Seed script: wipes the three collections and inserts sample data so the
// project can be demonstrated immediately after setup.
//
// Run with:  npm run seed   (from the backend folder)

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Customer = require("../models/Customer");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

const run = async () => {
  await connectDB();

  console.log("Clearing existing data...");
  await Transaction.deleteMany({});
  await Account.deleteMany({});
  await Customer.deleteMany({});

  console.log("Creating customers...");
  const [alice, bob, john] = await Customer.create([
    { fullName: "Alice Johnson", email: "alice.johnson@example.com", phone: "0711-222-333" },
    { fullName: "Bob Smith", email: "bob.smith@example.com", phone: "0722-333-444" },
    { fullName: "John Kamau", email: "john.kamau@example.com", phone: "0733-444-555" },
  ]);

  console.log("Creating accounts...");
  const [aliceAccount, bobAccount, johnAccount] = await Account.create([
    { accountNumber: "1001", customer: alice._id, accountType: "Savings", balance: 10000 },
    { accountNumber: "1002", customer: bob._id, accountType: "Current", balance: 5000 },
    { accountNumber: "1003", customer: john._id, accountType: "Savings", balance: 15000 },
  ]);

  console.log("Creating sample transactions...");
  await Transaction.create([
    {
      fromAccount: aliceAccount._id,
      toAccount: bobAccount._id,
      amount: 1500,
      status: "Completed",
      description: "Rent contribution",
      transactionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
    {
      fromAccount: bobAccount._id,
      toAccount: johnAccount._id,
      amount: 800,
      status: "Completed",
      description: "Payment for services",
      transactionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
    {
      fromAccount: johnAccount._id,
      toAccount: aliceAccount._id,
      amount: 25000,
      status: "Failed",
      description: "Attempted transfer - insufficient funds",
      transactionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    },
  ]);

  console.log("Seed complete!");
  console.log("Sample accounts:");
  console.log("  1001 - Alice Johnson  - Savings - KSh 10,000 (before sample tx above)");
  console.log("  1002 - Bob Smith      - Current - KSh 5,000");
  console.log("  1003 - John Kamau     - Savings - KSh 15,000");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
