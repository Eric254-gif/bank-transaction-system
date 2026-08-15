import { useEffect } from "react";

const Modal = ({ open, onClose, title, children, footer, maxWidth = "max-w-md" }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className={`relative w-full ${maxWidth} bg-white rounded-card shadow-card border border-black/5 animate-[fadeIn_.15s_ease-out]`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
          <h3 className="font-display font-semibold text-ink text-base">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-black/5 text-slate-muted"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/5">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
