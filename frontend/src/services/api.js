import axios from "axios";

// Central axios instance. All API URLs in this file must match the
// backend routes mounted in backend/server.js.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Unwraps axios errors into a plain message string so components can do
// simple try/catch + toast.error(err.message) without digging into
// error.response.data every time.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

// ---------------- Customers ----------------
export const getCustomers = (search = "") =>
  api.get("/customers", { params: search ? { search } : {} }).then((res) => res.data.data);

export const getCustomerById = (id) => api.get(`/customers/${id}`).then((res) => res.data.data);

export const createCustomer = (payload) =>
  api.post("/customers", payload).then((res) => res.data);

export const updateCustomer = (id, payload) =>
  api.put(`/customers/${id}`, payload).then((res) => res.data);

export const deleteCustomer = (id) => api.delete(`/customers/${id}`).then((res) => res.data);

// ---------------- Accounts ----------------
export const getAccounts = (search = "") =>
  api.get("/accounts", { params: search ? { search } : {} }).then((res) => res.data.data);

export const getAccountById = (id) => api.get(`/accounts/${id}`).then((res) => res.data.data);

export const createAccount = (payload) => api.post("/accounts", payload).then((res) => res.data);

// ---------------- Transactions ----------------
export const transferMoney = (payload) =>
  api.post("/transactions/transfer", payload).then((res) => res.data);

export const getTransactions = (params = {}) =>
  api.get("/transactions", { params }).then((res) => res.data);

export const getTransactionById = (id) =>
  api.get(`/transactions/${id}`).then((res) => res.data.data);

// ---------------- Dashboard ----------------
export const getDashboardStats = () =>
  api.get("/dashboard/stats").then((res) => res.data.data);

export default api;
