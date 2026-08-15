const properties = [
  {
    letter: "A",
    name: "Atomicity",
    summary: "All or nothing.",
    body:
      "The entire money transfer is treated as one indivisible unit of work. If any step fails — an invalid account, insufficient funds, a network error — every change made so far inside that transaction is undone. There is no possible outcome where the sender loses money but the receiver never receives it.",
    example: "If deducting from Alice succeeds but crediting Bob fails, MongoDB rolls back Alice's deduction too.",
  },
  {
    letter: "C",
    name: "Consistency",
    summary: "The database moves from one valid state to another.",
    body:
      "Every rule the schema defines — a balance can never go negative, an account type must be Savings or Current, an amount must be positive — is enforced before a transaction is allowed to commit. The database is never left in a state that breaks these rules.",
    example: "A transfer that would push a sender's balance below zero is rejected before anything is written.",
  },
  {
    letter: "I",
    name: "Isolation",
    summary: "Concurrent transactions don't interfere with each other.",
    body:
      "If two transfers involving the same account happen at nearly the same moment, MongoDB's session-based transactions ensure each one sees a consistent snapshot of the data and they don't corrupt each other's results.",
    example: "Two people transferring out of the same account at once won't both succeed if there's only enough balance for one.",
  },
  {
    letter: "D",
    name: "Durability",
    summary: "Once committed, it stays committed.",
    body:
      "After session.commitTransaction() completes, the new balances and the transaction record are permanently stored. Even if the server restarts immediately afterward, the change is not lost.",
    example: "A successful transfer will still show up in Transaction History after the backend server is restarted.",
  },
];

const AcidProperties = () => {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="font-display font-semibold text-ink text-lg mb-1">ACID Properties</h2>
        <p className="text-sm text-slate-muted max-w-2xl">
          ACID is the set of four guarantees a database transaction must provide. This project's money-transfer
          feature is built specifically to demonstrate all four, using MongoDB's multi-document transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {properties.map((p) => (
          <div key={p.letter} className="card p-6 flex gap-4">
            <div className="shrink-0 w-12 h-12 rounded-md bg-ink text-white font-display font-bold text-xl flex items-center justify-center">
              {p.letter}
            </div>
            <div>
              <h3 className="font-display font-semibold text-ink">{p.name}</h3>
              <p className="text-sm text-ledger-dark font-medium mb-2">{p.summary}</p>
              <p className="text-sm text-slate-muted mb-3">{p.body}</p>
              <div className="text-xs bg-black/[0.03] border border-black/5 rounded-md px-3 py-2 text-slate-muted">
                <span className="font-semibold text-ink">Example: </span>
                {p.example}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AcidProperties;
