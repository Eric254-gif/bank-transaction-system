# Bank Transaction Management System (MERN)

An academic full-stack project that demonstrates **database transaction concepts** — ACID properties,
MongoDB multi-document transactions, commit, rollback/abort, and transaction history — through a working
bank money-transfer application.

Built with **M**ongoDB, **E**xpress.js, **R**eact (Vite), and **N**ode.js. No TypeScript.

---

## 1. Project Overview

The core feature is a **money transfer** between two bank accounts. Every transfer is executed as a single
MongoDB **multi-document transaction** using a Mongoose session: either every step succeeds and the whole
thing is committed, or any single failure causes everything to be rolled back — the sender never loses money
without the receiver gaining it, and a failed transfer never partially applies.

Example:

```
Alice  (Account 1001, Savings) — balance KSh 10,000
Bob    (Account 1002, Current) — balance KSh 5,000

Alice transfers KSh 2,000 to Bob
  -> Alice = KSh 8,000
  -> Bob   = KSh 7,000
```

## 2. Features

- **Dashboard** — total customers, accounts, money in the system, transaction counts, and recent activity
- **Customer Management** — create, read, update, delete, and search customers
- **Account Management** — create accounts, search, and view balances/owners/types (balances can never go negative)
- **Transfer Money** — a guided transfer form with live balance display, validation, and a confirmation modal
- **Transaction Demo** — a step-by-step animated visualization of a real transaction committing or rolling back
- **Rollback Demonstration** — a one-click preset that intentionally triggers an insufficient-funds failure
- **Transaction History** — search, status filter, date filter, and pagination
- **ACID Properties page** — a plain-English explainer with concrete examples for a presentation

## 3. Technologies Used

| Layer      | Technology                                              |
|------------|----------------------------------------------------------|
| Database   | MongoDB (Mongoose ODM)                                   |
| Backend    | Node.js, Express.js                                       |
| Frontend   | React 18, Vite, React Router, Tailwind CSS, Axios, react-hot-toast |
| Dev tools  | dotenv, cors, nodemon                                      |

## 4. Project Structure

```
bank-transaction-system/
│
├── backend/
│   ├── config/db.js                 MongoDB connection
│   ├── controllers/                 Route handlers (business logic)
│   │   ├── customerController.js
│   │   ├── accountController.js
│   │   ├── transactionController.js  <- the core transaction logic
│   │   └── dashboardController.js
│   ├── models/                      Mongoose schemas
│   │   ├── Customer.js
│   │   ├── Account.js
│   │   └── Transaction.js
│   ├── routes/                      Express routers
│   ├── middleware/errorHandler.js   Centralized error handling
│   ├── utils/                       ApiError, asyncHandler helpers
│   ├── seed/seed.js                 Sample data seed script
│   ├── server.js                    App entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/              Sidebar, Topbar, Modal, StatCard, etc.
│   │   ├── pages/                   Dashboard, Customers, Accounts, TransferMoney,
│   │   │                            Transactions, TransactionDemo, AcidProperties, About
│   │   ├── layouts/MainLayout.jsx
│   │   ├── services/api.js          All backend API calls
│   │   ├── utils/format.js          Currency/date formatting
│   │   ├── App.jsx                  Route definitions
│   │   └── main.jsx                 React entry point
│   ├── index.html
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## 5. MongoDB Setup

MongoDB **transactions require a replica set** (a standalone `mongod` cannot run transactions). The easiest
option for a student project is a free **MongoDB Atlas** cluster, which is always configured as a replica set.

**Option A — MongoDB Atlas (recommended):**
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user and allow network access from your IP (or `0.0.0.0/0` for testing)
3. Copy the connection string — it will look like:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/bank_transaction_system`

**Option B — Local MongoDB as a single-node replica set:**
```bash
mongod --dbpath /path/to/data --replSet rs0
# then, in a mongosh shell connected to that instance:
rs.initiate()
```
Then use `MONGO_URI=mongodb://127.0.0.1:27017/bank_transaction_system` (with `?replicaSet=rs0` if needed).

## 6. Environment Variables

**backend/.env** (copy from `backend/.env.example`):
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/bank_transaction_system
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

**frontend/.env** (copy from `frontend/.env.example`):
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## 7. Backend Installation

```bash
npm install
npm install
cp .env.example .env
# edit .env with your MongoDB connection string
npm run seed   # optional: populate sample customers/accounts/transactions
npm run dev    # starts the API on http://localhost:5000
```

## 8. Frontend Installation

```bash
cd frontend
npm install
cp .env.example .env
npm run dev    # starts the app on http://localhost:5173
```

Open http://localhost:5173 in your browser once both servers are running.

## 9. How MongoDB Transactions Work in This Project

The transfer logic lives in `backend/controllers/transactionController.js`, in the `transferMoney` function.
The general pattern:

```javascript
const session = await mongoose.startSession();

try {
  session.startTransaction();

  const sender = await Account.findById(fromAccount).session(session);
  const receiver = await Account.findById(toAccount).session(session);

  if (sender.balance < amount) throw new ApiError(400, "Insufficient account balance");

  sender.balance -= amount;
  await sender.save({ session });

  receiver.balance += amount;
  await receiver.save({ session });

  await Transaction.create([{ fromAccount, toAccount, amount, status: "Completed" }], { session });

  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
} finally {
  session.endSession();
}
```

Every read (`.session(session)`) and write (`{ session }`) is explicitly tied to the same session. That is
what groups them into one atomic unit.

## 10. How COMMIT Works

`session.commitTransaction()` is only reached if every prior step succeeded. Up until that line, none of the
writes made inside the session are visible or permanent — MongoDB buffers them as part of the in-progress
transaction. Once committed, the new account balances and the new `Transaction` document are all persisted
together, atomically and durably.

## 11. How ROLLBACK / ABORT Works

If anything throws inside the `try` block — a missing account, insufficient funds, a validation error, even a
network hiccup — control jumps to the `catch` block, which calls `session.abortTransaction()`. This discards
every write made inside that session as if they never happened. The sender's and receiver's balances are left
exactly as they were before the request. The failed attempt is then logged as a separate `Transaction`
document with `status: "Failed"`, but that log entry is written **outside** the aborted session — it's an
audit record of the attempt, not part of the money movement itself.

You can see this live on the **Transaction Demo** page using the "Preset: Insufficient Funds" button, which
sets up a transfer amount larger than the sender's balance and shows the abort/rollback sequence animate.

## 12. ACID Properties

| Property    | What it means here                                                                 |
|-------------|--------------------------------------------------------------------------------------|
| Atomicity   | The whole transfer succeeds or none of it does — no partial updates.                |
| Consistency | Schema rules (e.g. balance ≥ 0) are enforced; the DB never ends up in an invalid state. |
| Isolation   | Concurrent transfers touching the same account don't corrupt each other's results.   |
| Durability  | Once committed, the new balances and transaction record survive a server restart.    |

See the in-app **ACID Properties** page for a fuller explanation with examples for each property.

## 13. How to Demonstrate This Project

1. Open the **Dashboard** to show the current system-wide numbers.
2. Go to **Transfer Money** and complete a normal, successful transfer between two seeded accounts.
3. Go to **Transaction Demo**, click **Preset: Success**, then **Run Transaction Demo** — watch each commit
   step light up in order, ending in a green "Transaction Committed" stamp.
4. On the same page, click **Preset: Insufficient Funds**, then **Run Transaction Demo** — watch validation
   fail and the transaction abort/roll back, ending in a red "Transaction Aborted" stamp.
5. Go to **Transaction History** and show both the successful and failed transactions logged with their
   statuses, filters, and pagination.
6. Finish on **ACID Properties** to tie the demonstration back to the underlying database theory.

## 14. Sample Data

Running `npm run seed` in `backend/` creates:

```
Alice Johnson  — Account 1001 — Savings — KSh 10,000
Bob Smith      — Account 1002 — Current — KSh 5,000
John Kamau     — Account 1003 — Savings — KSh 15,000
```

plus a few sample transaction records (including one failed transfer) so the Dashboard and Transaction
History pages aren't empty on first run.

## 15. REST API Reference

```
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id

GET    /api/accounts
POST   /api/accounts
GET    /api/accounts/:id

POST   /api/transactions/transfer
GET    /api/transactions
GET    /api/transactions/:id

GET    /api/dashboard/stats
```

All endpoints return JSON in the shape `{ success: boolean, message?: string, data?: ... }`.
