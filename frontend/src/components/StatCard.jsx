const toneClasses = {
  neutral: "bg-ink text-white",
  success: "bg-ledger text-white",
  danger: "bg-danger text-white",
  amber: "bg-amber text-white",
};

const StatCard = ({ label, value, sublabel, tone = "neutral", icon }) => {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-muted">{label}</p>
        {icon && (
          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${toneClasses[tone]}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="font-display text-2xl md:text-3xl font-bold text-ink">{value}</p>
      {sublabel && <p className="text-xs text-slate-muted">{sublabel}</p>}
    </div>
  );
};

export default StatCard;
