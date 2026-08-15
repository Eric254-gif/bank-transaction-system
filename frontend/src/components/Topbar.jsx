import { useLocation } from "react-router-dom";

const titles = {
  "/": "Dashboard",
  "/customers": "Customers",
  "/accounts": "Accounts",
  "/transfer": "Transfer Money",
  "/transactions": "Transaction History",
  "/transaction-demo": "Transaction Demo",
  "/acid-properties": "ACID Properties",
  "/about": "About This Project",
};

const Topbar = ({ onMenuClick }) => {
  const location = useLocation();
  const title = titles[location.pathname] || "Ledger";

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-4 lg:px-8 border-b border-black/5 bg-white/80 backdrop-blur sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-black/5"
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
        <h1 className="font-display text-lg font-semibold text-ink">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-ledger-dark bg-ledger-light px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-ledger" />
          Live API Connected
        </span>
        <div className="w-9 h-9 rounded-full bg-ink text-white flex items-center justify-center text-xs font-display font-semibold">
          BT
        </div>
      </div>
    </header>
  );
};

export default Topbar;
