const config = {
  Completed: { className: "badge-success", label: "Completed" },
  Failed: { className: "badge-danger", label: "Failed" },
  "Rolled Back": { className: "badge-warning", label: "Rolled Back" },
};

const StatusBadge = ({ status }) => {
  const c = config[status] || { className: "badge bg-black/5 text-slate-muted", label: status };
  return <span className={c.className}>{c.label}</span>;
};

export default StatusBadge;
