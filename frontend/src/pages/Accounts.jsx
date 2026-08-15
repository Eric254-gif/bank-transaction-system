import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAccounts, createAccount, getCustomers } from "../services/api.js";
import Modal from "../components/Modal.jsx";
import { Spinner, EmptyState, ErrorState } from "../components/StateViews.jsx";
import { formatMoney, formatDate } from "../utils/format.js";

const emptyForm = { accountNumber: "", customer: "", accountType: "Savings", balance: "" };

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [customers, setCustomers] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [detailsAccount, setDetailsAccount] = useState(null);

  const load = (searchTerm = "") => {
    setLoading(true);
    setError(null);
    getAccounts(searchTerm)
      .then(setAccounts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  useEffect(() => {
    const timeout = setTimeout(() => load(search), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = async () => {
    setForm(emptyForm);
    setFormOpen(true);
    try {
      const list = await getCustomers();
      setCustomers(list);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAccount({
        accountNumber: form.accountNumber,
        customer: form.customer,
        accountType: form.accountType,
        balance: form.balance === "" ? 0 : Number(form.balance),
      });
      toast.success("Account created successfully");
      setFormOpen(false);
      load(search);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted"
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          >
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" />
          </svg>
          <input
            className="input pl-9"
            placeholder="Search by account number or owner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Create Account
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={() => load(search)} />
        ) : accounts.length === 0 ? (
          <EmptyState
            title="No accounts found"
            description="Create an account for a customer to get started."
            action={<button className="btn-primary" onClick={openCreate}>+ Create Account</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-shell">
              <thead>
                <tr>
                  <th>Account No.</th>
                  <th>Owner</th>
                  <th>Type</th>
                  <th>Balance</th>
                  <th>Opened</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a._id}>
                    <td className="font-mono font-medium text-ink">#{a.accountNumber}</td>
                    <td>{a.customer?.fullName || "—"}</td>
                    <td>
                      <span className="badge bg-black/5 text-ink">{a.accountType}</span>
                    </td>
                    <td className="money font-semibold text-ledger-dark">{formatMoney(a.balance)}</td>
                    <td className="text-slate-muted">{formatDate(a.createdAt)}</td>
                    <td className="text-right">
                      <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => setDetailsAccount(a)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create account modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Create Account">
        <form onSubmit={submitForm} className="space-y-4">
          <div>
            <label className="label">Account Number</label>
            <input
              className="input font-mono"
              required
              value={form.accountNumber}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              placeholder="e.g. 1004"
            />
          </div>
          <div>
            <label className="label">Owner</label>
            <select
              className="input"
              required
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
            >
              <option value="" disabled>
                Select a customer
              </option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.fullName}
                </option>
              ))}
            </select>
            {customers.length === 0 && (
              <p className="text-xs text-slate-muted mt-1.5">
                No customers yet — add one on the Customers page first.
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Account Type</label>
              <select
                className="input"
                value={form.accountType}
                onChange={(e) => setForm({ ...form, accountType: e.target.value })}
              >
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
              </select>
            </div>
            <div>
              <label className="label">Opening Balance</label>
              <input
                className="input font-mono"
                type="number"
                min="0"
                step="0.01"
                value={form.balance}
                onChange={(e) => setForm({ ...form, balance: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting || customers.length === 0}>
              {submitting ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Account details modal */}
      <Modal open={!!detailsAccount} onClose={() => setDetailsAccount(null)} title="Account Details">
        {detailsAccount && (
          <div className="space-y-4 text-sm">
            <div className="rounded-md bg-ink text-white p-5">
              <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Current Balance</p>
              <p className="money text-2xl font-bold">{formatMoney(detailsAccount.balance)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="label mb-0.5">Account Number</p>
                <p className="font-mono font-medium text-ink">#{detailsAccount.accountNumber}</p>
              </div>
              <div>
                <p className="label mb-0.5">Account Type</p>
                <p className="font-medium text-ink">{detailsAccount.accountType}</p>
              </div>
              <div>
                <p className="label mb-0.5">Owner</p>
                <p className="font-medium text-ink">{detailsAccount.customer?.fullName}</p>
              </div>
              <div>
                <p className="label mb-0.5">Opened</p>
                <p className="font-medium text-ink">{formatDate(detailsAccount.createdAt)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Accounts;
