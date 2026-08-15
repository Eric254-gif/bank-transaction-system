import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAccounts, transferMoney } from "../services/api.js";
import { Spinner } from "../components/StateViews.jsx";
import { formatMoney } from "../utils/format.js";

const successSteps = [
  "Transaction Started",
  "Sender Validated",
  "Receiver Validated",
  "Balance Checked",
  "Sender Updated",
  "Receiver Updated",
  "Transaction Record Created",
  "Transaction Committed",
];

const failSteps = [
  "Transaction Started",
  "Validation Started",
  "Operation Failed",
  "Transaction Aborted",
  "Changes Rolled Back",
];

const STEP_DELAY = 450;

const TransactionDemo = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");

  const [running, setRunning] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [outcome, setOutcome] = useState(null); // "success" | "failure" | null
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    getAccounts()
      .then(setAccounts)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const sender = accounts.find((a) => a._id === fromAccount);
  const receiver = accounts.find((a) => a._id === toAccount);

  const loadPreset = (kind) => {
    if (accounts.length < 2) return;
    const a = accounts[0];
    const b = accounts[1];
    setFromAccount(a._id);
    setToAccount(b._id);
    if (kind === "success") {
      setAmount(String(Math.max(1, Math.floor(a.balance * 0.1))));
    } else {
      // Deliberately larger than the sender's balance to trigger rollback
      setAmount(String(a.balance + 15000));
    }
    setOutcome(null);
    setVisibleSteps(0);
  };

  const animateSteps = (steps, onDone) => {
    setVisibleSteps(0);
    steps.forEach((_, i) => {
      setTimeout(() => {
        setVisibleSteps(i + 1);
        if (i === steps.length - 1) onDone();
      }, STEP_DELAY * (i + 1));
    });
  };

  const runDemo = async () => {
    if (!fromAccount || !toAccount || !amount) {
      toast.error("Select accounts and an amount first");
      return;
    }
    setRunning(true);
    setOutcome(null);
    setVisibleSteps(0);

    try {
      // Fire the real API call immediately; we animate the steps while
      // (and slightly beyond) the network request resolves, so the
      // visual pacing stays consistent for a live presentation.
      const apiPromise = transferMoney({ fromAccount, toAccount, amount: Number(amount) });

      let willSucceed = true;
      let message = "";

      try {
        const res = await apiPromise;
        message = res.message;
      } catch (err) {
        willSucceed = false;
        message = err.message;
      }

      const steps = willSucceed ? successSteps : failSteps;
      animateSteps(steps, () => {
        setOutcome(willSucceed ? "success" : "failure");
        setResultMessage(message);
        setRunning(false);
        // Refresh balances so the demo shows the real post-transfer state
        getAccounts().then(setAccounts).catch(() => {});
      });
    } catch (err) {
      setRunning(false);
      toast.error(err.message);
    }
  };

  if (loading) return <Spinner label="Loading accounts..." />;

  const steps = outcome === "failure" ? failSteps : successSteps;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="card p-5">
          <h2 className="font-display font-semibold text-ink mb-1">Set Up a Demo</h2>
          <p className="text-sm text-slate-muted mb-4">
            Choose accounts and an amount, or use a one-click preset.
          </p>

          <div className="space-y-4">
            <div>
              <label className="label">From Account</label>
              <select className="input" value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}>
                <option value="">Select sender</option>
                {accounts.map((a) => (
                  <option key={a._id} value={a._id}>
                    #{a.accountNumber} — {a.customer?.fullName} ({formatMoney(a.balance)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">To Account</label>
              <select className="input" value={toAccount} onChange={(e) => setToAccount(e.target.value)}>
                <option value="">Select receiver</option>
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
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <button className="btn-secondary" onClick={() => loadPreset("success")} disabled={accounts.length < 2}>
              Preset: Success
            </button>
            <button className="btn-secondary" onClick={() => loadPreset("fail")} disabled={accounts.length < 2}>
              Preset: Insufficient Funds
            </button>
          </div>

          <button className="btn-primary w-full mt-4" onClick={runDemo} disabled={running}>
            {running ? "Running Transaction..." : "Run Transaction Demo"}
          </button>
        </div>

        {sender && receiver && (
          <div className="card p-5 text-sm space-y-2">
            <p className="font-display font-semibold text-ink mb-1">Snapshot</p>
            <div className="flex justify-between">
              <span className="text-slate-muted">Sender balance</span>
              <span className="money font-medium">{formatMoney(sender.balance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-muted">Receiver balance</span>
              <span className="money font-medium">{formatMoney(receiver.balance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-muted">Transfer amount</span>
              <span className="money font-medium">{formatMoney(amount)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-3 card p-6 relative overflow-hidden">
        <h2 className="font-display font-semibold text-ink mb-1">Live Transaction Flow</h2>
        <p className="text-sm text-slate-muted mb-6">
          Each step below is executed inside one Mongoose session on the backend.
        </p>

        <ol className="space-y-0">
          {steps.map((label, i) => {
            const active = i < visibleSteps;
            const isFailureStep = outcome === "failure" && (label.includes("Failed") || label.includes("Aborted") || label.includes("Rolled Back"));
            return (
              <li key={label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      !active
                        ? "border-black/10 text-black/20"
                        : isFailureStep
                        ? "border-danger bg-danger text-white"
                        : "border-ledger bg-ledger text-white"
                    }`}
                  >
                    {active ? (
                      isFailureStep ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      )
                    ) : (
                      <span className="text-xs font-semibold">{i + 1}</span>
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-0.5 flex-1 min-h-[28px] transition-colors duration-300 ${active ? (isFailureStep ? "bg-danger" : "bg-ledger") : "bg-black/10"}`} />
                  )}
                </div>
                <div className="pb-7 pt-1">
                  <p className={`text-sm font-medium transition-colors duration-300 ${active ? "text-ink" : "text-black/30"}`}>
                    {label}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {outcome && (
          <div
            className={`mt-2 flex items-center gap-4 rounded-card border-2 p-5 ${
              outcome === "success" ? "border-ledger bg-ledger-light" : "border-danger bg-danger-light"
            }`}
          >
            <div
              className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center rotate-[-8deg] border-[3px] font-display font-bold text-[11px] tracking-widest ${
                outcome === "success" ? "border-ledger text-ledger-dark" : "border-danger text-danger"
              }`}
            >
              {outcome === "success" ? "OK" : "NO"}
            </div>
            <div>
              <p className={`font-display font-semibold ${outcome === "success" ? "text-ledger-dark" : "text-danger"}`}>
                {outcome === "success" ? "Transaction Committed" : "Transaction Aborted"}
              </p>
              <p className="text-sm text-slate-muted">{resultMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionDemo;
