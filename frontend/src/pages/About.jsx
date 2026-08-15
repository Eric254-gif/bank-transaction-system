const stack = [
  { name: "MongoDB", role: "Database — stores customers, accounts, and transactions; provides ACID transactions" },
  { name: "Express.js", role: "Backend web framework — REST API routing and middleware" },
  { name: "React (Vite)", role: "Frontend UI — dashboard, forms, and transaction demos" },
  { name: "Node.js", role: "JavaScript runtime powering the backend server" },
  { name: "Mongoose", role: "ODM — schemas, validation, and the session/transaction API" },
];

const About = () => {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="font-display font-semibold text-ink text-lg mb-2">About This Project</h2>
        <p className="text-sm text-slate-muted max-w-2xl">
          This Bank Transaction Management System is an academic MERN-stack project built to demonstrate how
          real-world database transactions work — specifically MongoDB's multi-document ACID transactions. The
          core feature is a money transfer between two bank accounts, performed as a single atomic operation
          using a Mongoose session.
        </p>
      </div>

      <div className="card p-6">
        <h3 className="font-display font-semibold text-ink mb-4">Technology Stack</h3>
        <div className="space-y-3">
          {stack.map((s) => (
            <div key={s.name} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-black/5 last:border-0">
              <span className="font-mono text-sm font-semibold text-ink sm:w-36 shrink-0">{s.name}</span>
              <span className="text-sm text-slate-muted">{s.role}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-display font-semibold text-ink mb-3">How to Demonstrate This Project</h3>
        <ol className="text-sm text-slate-muted space-y-2 list-decimal list-inside">
          <li>Show the Dashboard to summarize the current state of the system.</li>
          <li>Open Transfer Money and complete a normal, successful transfer.</li>
          <li>Open Transaction Demo and run the "Preset: Success" flow to show each commit step animate.</li>
          <li>Run "Preset: Insufficient Funds" to show validation, abort, and rollback in action.</li>
          <li>Open Transaction History to show both transactions logged with their statuses.</li>
          <li>Finish on the ACID Properties page to explain the theory behind what was just demonstrated.</li>
        </ol>
      </div>
    </div>
  );
};

export default About;
