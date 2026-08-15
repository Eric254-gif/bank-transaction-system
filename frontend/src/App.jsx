import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Customers from "./pages/Customers.jsx";
import Accounts from "./pages/Accounts.jsx";
import TransferMoney from "./pages/TransferMoney.jsx";
import Transactions from "./pages/Transactions.jsx";
import TransactionDemo from "./pages/TransactionDemo.jsx";
import AcidProperties from "./pages/AcidProperties.jsx";
import About from "./pages/About.jsx";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/transfer" element={<TransferMoney />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/transaction-demo" element={<TransactionDemo />} />
        <Route path="/acid-properties" element={<AcidProperties />} />
        <Route path="/about" element={<About />} />
      </Route>
    </Routes>
  );
}

export default App;
