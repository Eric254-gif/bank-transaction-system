export const Spinner = ({ label = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-muted">
    <div className="w-8 h-8 border-2 border-ledger border-t-transparent rounded-full animate-spin" />
    <p className="text-sm">{label}</p>
  </div>
);

export const EmptyState = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-2 text-center px-6">
    <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-1">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-slate-muted">
        <path d="M4 7h16M4 12h10M4 17h7" strokeLinecap="round" />
      </svg>
    </div>
    <p className="font-display font-semibold text-ink">{title}</p>
    {description && <p className="text-sm text-slate-muted max-w-sm">{description}</p>}
    {action && <div className="mt-3">{action}</div>}
  </div>
);

export const ErrorState = ({ message = "Something went wrong.", onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-2 text-center px-6">
    <div className="w-12 h-12 rounded-full bg-danger-light flex items-center justify-center mb-1">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-danger">
        <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    </div>
    <p className="font-display font-semibold text-ink">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary mt-2">
        Try again
      </button>
    )}
  </div>
);
