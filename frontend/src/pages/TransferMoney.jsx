import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getAccounts, transferMoney } from "../services/api.js";
import Modal from "../components/Modal.jsx";
import { Spinner } from "../components/StateViews.jsx";
import { formatMoney } from "../utils/format.js";

const TransferMoney = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { success, message }

  useEffect(() => {
    getAccounts()
      .then(setAccounts)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const sender = useMemo(() => accounts.find((a) => a._id === fromAccount), [accounts, fromAccount]);
  const receiver = useMemo(() => accounts.find((a) => a._id === toAccount), [accounts, toAccount]);

  const numericAmount = Number(amount);

  const errors = useMemo(() => {
    const list = [];
    if (fromAccount && toAccount && fromAccount === toAccount) {
      list.push("Sender and receiver accounts must be different.");
    }
    if (amount && (!numericAmount || numericAmount <= 0)) {
      list.push("Amount must be greater than zero.");
    }
    if (sender && numericAmount && numericAmount > sender.balance) {
      list.push("Sender has insufficient funds for this transfer.");
    }
    return list;
  }, [fromAccount, toAccount, amount, numericAmount, sender]);

  const canSubmit =
    fromAccount && toAccount && numericAmount > 0 && errors.length === 0 && !submitting;

  const openConfirm = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setConfirmOpen(true);
  };

  const doTransfer = async () => {
    setSubmitting(true);
    try {
      const res = await transferMoney({
        fromAccount,
        toAccount,
        amount: numericAmount,
        description,
      });
      setResult({ success: true, message: res.message });
      toast.success(res.message);
      setConfirmOpen(false);
      setFromAccount("");
      setToAccount("");
      setAmount("");
      setDescription("");
      // Refresh account balances shown on this page
      getAccounts().then(setAccounts).catch(() => {});
    } catch (err) {
      setResult({ success: false, message: err.message });
      toast.error(err.message);
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Loading accounts..." />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 card p-6">
        <h2 className="font-display font-semibold text-ink text-lg mb-1">Send Money</h2>
        <p className="text-sm text-slate-muted mb-6">
          Every transfer runs inside a single MongoDB transaction — it either fully succeeds or fully rolls back.
        </p>

        <form onSubmit={openConfirm} className="space-y-5">
          <div>
            <label className="label">From Account</label>
            <select className="input" value={fromAccount} onChange={(e) => setFromAccount(e.target.value)} required>
              <option value="" disabled>Select sender account</option>
              {accounts.map((a) => (
                <option key={a._id} value={a._id}>
                  #{a.accountNumber} — {a.customer?.fullName} ({formatMoney(a.balance)})
                </option>
              ))}
            </select>
            {sender && (
              <p className="text-xs text-slate-muted mt-1.5">
                Current balance:{" "}
                <span className="money font-semibold text-ledger-dark">{formatMoney(sender.balance)}</span>
              </p>
            )}
          </div>

          <div>
            <label className="label">To Account</label>
            <select className="input" value={toAccount} onChange={(e) => setToAccount(e.target.value)} required>
              <option value="" disabled>Select receiver account</option>
              {accounts.map((a) => (
                <option key={a._id} value={a._id}>
                  #{a.accountNumber} — {a.customer?.fullName} ({formatMoney(a.balance)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Amount (KSh)</label>
            <input
              className="input money"
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <input
              className="input"
              placeholder="e.g. Rent contribution"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {errors.length > 0 && (
            <div className="rounded-md bg-danger-light border border-danger/20 px-4 py-3 text-sm text-danger space-y-1">
              {errors.map((e) => (
                <p key={e}>{e}</p>
              ))}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={!canSubmit}>
            Transfer Money
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="card p-5">
          <h3 className="font-display font-semibold text-ink text-sm mb-3">How it works</h3>
          <ol className="text-sm text-slate-muted space-y-2 list-decimal list-inside">
            <li>The backend opens a MongoDB session and starts a transaction.</li>
            <li>It validates both accounts and checks the sender's balance.</li>
            <li>It deducts from the sender and credits the receiver.</li>
            <li>It creates a transaction record — all inside the same session.</li>
            <li>If every step succeeds, the transaction is committed.</li>
            <li>If any step fails, everything is rolled back automatically.</li>
          </ol>
        </div>

        {result && (
          <div
            className={`card p-5 border-l-4 ${
              result.success ? "border-l-ledger" : "border-l-danger"
            }`}
          >
            <p className={`font-display font-semibold mb-1 ${result.success ? "text-ledger-dark" : "text-danger"}`}>
              {result.success ? "✓ Transaction Successful" : "✗ Transaction Failed"}
            </p>
            <p className="text-sm text-slate-muted">{result.message}</p>
            <button
              onClick={() => navigate("/transactions")}
              className="text-sm font-medium text-ledger hover:underline mt-2 inline-block"
            >
              View transaction history →
            </button>
          </div>
        )}
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => !submitting && setConfirmOpen(false)}
        title="Confirm Transfer"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setConfirmOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button className="btn-primary" onClick={doTransfer} disabled={submitting}>
              {submitting ? "Processing..." : "Confirm & Transfer"}
            </button>
          </>
        }
      >
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between px-4 py-3 rounded-md bg-black/[0.02] border border-black/5">
            <div>
              <p className="text-xs text-slate-muted">From</p>
              <p className="font-medium text-ink">{sender?.customer?.fullName} <span className="font-mono text-xs text-slate-muted">#{sender?.accountNumber}</span></p>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-ledger">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-right">
              <p className="text-xs text-slate-muted">To</p>
              <p className="font-medium text-ink">{receiver?.customer?.fullName} <span className="font-mono text-xs text-slate-muted">#{receiver?.accountNumber}</span></p>
            </div>
          </div>
          <div className="text-center py-2">
            <p className="text-xs text-slate-muted uppercase tracking-wide mb-1">Amount</p>
            <p className="money text-3xl font-bold text-ink">{formatMoney(numericAmount)}</p>
          </div>
          {description && (
            <p className="text-center text-slate-muted italic">"{description}"</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TransferMoney;
