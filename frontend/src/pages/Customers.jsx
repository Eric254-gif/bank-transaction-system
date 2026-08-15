import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
} from "../services/api.js";
import Modal from "../components/Modal.jsx";
import { Spinner, EmptyState, ErrorState } from "../components/StateViews.jsx";
import { formatMoney, formatDate } from "../utils/format.js";

const emptyForm = { fullName: "", email: "", phone: "" };

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // create | edit
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [detailsCustomer, setDetailsCustomer] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const load = (searchTerm = "") => {
    setLoading(true);
    setError(null);
    getCustomers(searchTerm)
      .then(setCustomers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  useEffect(() => {
    const timeout = setTimeout(() => load(search), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setFormMode("create");
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (customer) => {
    setFormMode("edit");
    setForm({ fullName: customer.fullName, email: customer.email, phone: customer.phone });
    setEditingId(customer._id);
    setFormOpen(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (formMode === "create") {
        await createCustomer(form);
        toast.success("Customer created successfully");
      } else {
        await updateCustomer(editingId, form);
        toast.success("Customer updated successfully");
      }
      setFormOpen(false);
      load(search);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteCustomer(deleteTarget._id);
      toast.success("Customer deleted successfully");
      setDeleteTarget(null);
      load(search);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const openDetails = async (customer) => {
    setDetailsCustomer({ ...customer, accounts: [] });
    setDetailsLoading(true);
    try {
      const full = await getCustomerById(customer._id);
      setDetailsCustomer(full);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDetailsLoading(false);
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
            placeholder="Search by name, email or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Add Customer
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={() => load(search)} />
        ) : customers.length === 0 ? (
          <EmptyState
            title="No customers found"
            description="Add your first customer to get started."
            action={<button className="btn-primary" onClick={openCreate}>+ Add Customer</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-shell">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <button className="font-medium text-ink hover:text-ledger" onClick={() => openDetails(c)}>
                        {c.fullName}
                      </button>
                    </td>
                    <td className="text-slate-muted">{c.email}</td>
                    <td className="font-mono text-xs text-slate-muted">{c.phone}</td>
                    <td className="text-slate-muted">{formatDate(c.createdAt)}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => openEdit(c)}>
                          Edit
                        </button>
                        <button
                          className="btn-danger !px-3 !py-1.5 text-xs"
                          onClick={() => setDeleteTarget(c)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit form modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={formMode === "create" ? "Add Customer" : "Edit Customer"}
      >
        <form onSubmit={submitForm} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              className="input"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="e.g. Alice Johnson"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. alice@example.com"
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. 0711-222-333"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : formMode === "create" ? "Add Customer" : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Customer"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </button>
            <button className="btn-danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Customer"}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-muted">
          Are you sure you want to delete <span className="font-semibold text-ink">{deleteTarget?.fullName}</span>?
          This action cannot be undone.
        </p>
      </Modal>

      {/* Customer details modal */}
      <Modal
        open={!!detailsCustomer}
        onClose={() => setDetailsCustomer(null)}
        title="Customer Details"
        maxWidth="max-w-lg"
      >
        {detailsCustomer && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="label mb-0.5">Full Name</p>
                <p className="text-ink font-medium">{detailsCustomer.fullName}</p>
              </div>
              <div>
                <p className="label mb-0.5">Joined</p>
                <p className="text-ink font-medium">{formatDate(detailsCustomer.createdAt)}</p>
              </div>
              <div>
                <p className="label mb-0.5">Email</p>
                <p className="text-ink font-medium">{detailsCustomer.email}</p>
              </div>
              <div>
                <p className="label mb-0.5">Phone</p>
                <p className="text-ink font-medium font-mono">{detailsCustomer.phone}</p>
              </div>
            </div>

            <div>
              <p className="label mb-2">Linked Accounts</p>
              {detailsLoading ? (
                <Spinner label="Loading accounts..." />
              ) : detailsCustomer.accounts?.length ? (
                <div className="space-y-2">
                  {detailsCustomer.accounts.map((a) => (
                    <div key={a._id} className="flex items-center justify-between px-3 py-2.5 rounded-md bg-black/[0.02] border border-black/5">
                      <div>
                        <p className="font-mono text-sm text-ink">#{a.accountNumber}</p>
                        <p className="text-xs text-slate-muted">{a.accountType}</p>
                      </div>
                      <p className="money font-semibold text-ledger-dark">{formatMoney(a.balance)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-muted">No accounts linked to this customer yet.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Customers;
