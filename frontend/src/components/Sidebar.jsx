import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: "grid" },
  { to: "/customers", label: "Customers", icon: "users" },
  { to: "/accounts", label: "Accounts", icon: "wallet" },
  { to: "/transfer", label: "Transfer Money", icon: "arrows" },
  { to: "/transactions", label: "Transactions", icon: "list" },
  { to: "/transaction-demo", label: "Transaction Demo", icon: "flow" },
  { to: "/acid-properties", label: "ACID Properties", icon: "shield" },
  { to: "/about", label: "About Project", icon: "info" },
];

// A tiny inline icon set (no icon library dependency) keyed by name.
const Icon = ({ name, className }) => {
  const common = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "grid":
      return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>;
    case "users":
      return <svg {...common}><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17.5" cy="9" r="2.5" /><path d="M15 20c0-2.5 1.4-4.6 3.5-5.4" /></svg>;
    case "wallet":
      return <svg {...common}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><circle cx="16.5" cy="14" r="1" fill="currentColor" stroke="none" /></svg>;
    case "arrows":
      return <svg {...common}><path d="M7 7h11l-3-3" /><path d="M17 17H6l3 3" /></svg>;
    case "list":
      return <svg {...common}><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" /></svg>;
    case "flow":
      return <svg {...common}><rect x="3" y="3" width="6" height="6" rx="1.2" /><rect x="15" y="15" width="6" height="6" rx="1.2" /><path d="M9 6h6a3 3 0 0 1 3 3v6" /></svg>;
    case "shield":
      return <svg {...common}><path d="M12 3l7 3v6c0 4.4-3 8-7 9-4-1-7-4.6-7-9V6l7-3z" /></svg>;
    case "info":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></svg>;
    default:
      return null;
  }
};

const Sidebar = ({ open, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed z-40 lg:z-0 top-0 left-0 h-full w-64 bg-ink text-white flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10 shrink-0">
          <div className="w-8 h-8 rounded-md bg-ledger flex items-center justify-center font-display font-bold text-white">
            L
          </div>
          <div>
            <p className="font-display font-semibold leading-tight">Ledger</p>
            <p className="text-[11px] text-white/50 leading-tight">Transaction System</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-ledger text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon name={item.icon} className="w-[18px] h-[18px] shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-white/10 text-[11px] text-white/40">
          MERN Academic Project
          <br />
          Demonstrating ACID Transactions
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
