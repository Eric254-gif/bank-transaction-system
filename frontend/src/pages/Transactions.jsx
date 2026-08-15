import { useEffect, useState } from "react";
import { getTransactions } from "../services/api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { Spinner, EmptyState, ErrorState } from "../components/StateViews.jsx";
import { formatMoney, formatDate } from "../utils/format.js";

const statusOptions = ["All", "Completed", "Failed", "Rolled Back"];

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    setError(null);
    getTransactions({
      search: search || undefined,
      status: status !== "All" ? status : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page,
      limit: 10,
    })
      .then((res) => {
        setTransactions(res.data);
        setPagination(res.pagination);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  useEffect(() => {
    setPage(1);
    const timeout = setTimeout(load, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, startDate, endDate]);

  return (
    <div className="space-y-5">
      <div className="card p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1 min-w-[220px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" />
          </svg>
          <input
            className="input pl-9"
            placeholder="Search account, name or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input lg:w-44" value={status} onChange={(e) => setStatus(e.target.value)}>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input type="date" className="input lg:w-44" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" className="input lg:w-44" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : transactions.length === 0 ? (
          <EmptyState title="No transactions found" description="Try adjusting your filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table-shell">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Sender</th>
                    <th>Receiver</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t._id}>
                      <td className="font-mono text-xs text-slate-muted">{t._id.slice(-8)}</td>
                      <td>
                        {t.fromAccount?.customer?.fullName || "—"}{" "}
                        <span className="text-slate-muted font-mono text-xs">#{t.fromAccount?.accountNumber || "?"}</span>
                      </td>
                      <td>
                        {t.toAccount?.customer?.fullName || "—"}{" "}
                        <span className="text-slate-muted font-mono text-xs">#{t.toAccount?.accountNumber || "?"}</span>
                      </td>
                      <td className="money font-medium">{formatMoney(t.amount)}</td>
                      <td><StatusBadge status={t.status} /></td>
                      <td className="text-slate-muted">{formatDate(t.transactionDate)}</td>
                      <td className="text-slate-muted max-w-[180px] truncate">{t.description || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-black/5 text-sm">
              <p className="text-slate-muted">
                Page {pagination.page} of {pagination.totalPages} &middot; {pagination.total} total
              </p>
              <div className="flex gap-2">
                <button
                  className="btn-secondary !px-3 !py-1.5 text-xs"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <button
                  className="btn-secondary !px-3 !py-1.5 text-xs"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Transactions;
