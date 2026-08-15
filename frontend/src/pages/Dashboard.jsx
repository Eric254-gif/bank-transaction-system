import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../services/api.js";
import StatCard from "../components/StatCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { Spinner, ErrorState, EmptyState } from "../components/StateViews.jsx";
import { formatMoney, formatDate } from "../utils/format.js";

const icons = {
  customers: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  ),
  accounts: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" />
    </svg>
  ),
  money: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" /><path d="M9.5 15.5c.6.7 1.5 1 2.5 1 1.7 0 3-1 3-2.4 0-3-5.5-1.6-5.5-4.5C9.5 8.2 10.8 7 12.5 7c1 0 1.9.4 2.5 1" />
    </svg>
  ),
  total: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
    </svg>
  ),
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  failed: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  ),
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <Spinner label="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={stats.totalCustomers} icon={icons.customers} />
        <StatCard label="Total Accounts" value={stats.totalAccounts} icon={icons.accounts} />
        <StatCard
          label="Total Money in Accounts"
          value={formatMoney(stats.totalMoney)}
          tone="success"
          icon={icons.money}
        />
        <StatCard label="Total Transactions" value={stats.totalTransactions} icon={icons.total} />
        <StatCard
          label="Successful Transactions"
          value={stats.successfulTransactions}
          tone="success"
          icon={icons.success}
        />
        <StatCard
          label="Failed Transactions"
          value={stats.failedTransactions}
          tone="danger"
          icon={icons.failed}
        />
      </div>

      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
          <h2 className="font-display font-semibold text-ink">Recent Transactions</h2>
          <Link to="/transactions" className="text-sm font-medium text-ledger hover:underline">
            View all
          </Link>
        </div>

        {stats.recentTransactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Once a transfer is made, it will show up here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-shell">
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions.map((t) => (
                  <tr key={t._id}>
                    <td className="font-medium text-ink">
                      {t.fromAccount?.customer?.fullName || "—"}{" "}
                      <span className="text-slate-muted font-mono text-xs">
                        #{t.fromAccount?.accountNumber || "?"}
                      </span>
                    </td>
                    <td className="font-medium text-ink">
                      {t.toAccount?.customer?.fullName || "—"}{" "}
                      <span className="text-slate-muted font-mono text-xs">
                        #{t.toAccount?.accountNumber || "?"}
                      </span>
                    </td>
                    <td className="money font-medium">{formatMoney(t.amount)}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td className="text-slate-muted">{formatDate(t.transactionDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
