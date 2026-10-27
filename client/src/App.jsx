import { useState, useEffect } from "react";
import "./App.css";

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/expenses";
const cleanApiUrl = rawApiUrl.replace(/\/+$/, "");
const API_URL = cleanApiUrl.endsWith("/api/expenses") ? cleanApiUrl : `${cleanApiUrl}/api/expenses`;

function App() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Load expenses from MongoDB through the backend
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Failed to load expenses.");
        }

        const data = await response.json();
        setExpenses(data);
      } catch (err) {
        console.error("Loading expenses failed:", err);
        setError(
          "Unable to load expenses. Make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  const currentMonth = new Date().toISOString().slice(0, 7);

  const monthlyExpenses = expenses
    .filter((expense) => expense.date.startsWith(currentMonth))
    .reduce((total, expense) => total + expense.amount, 0);

  // Add an expense to MongoDB
  const handleAddExpense = async (event) => {
    event.preventDefault();

    if (
      !title.trim() ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      !date
    ) {
      alert("Please enter valid expense details.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          amount: Number(amount),
          category,
          date,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add expense.");
      }

      // Use the actual MongoDB document returned by the backend
      setExpenses((previousExpenses) => [data, ...previousExpenses]);

      setTitle("");
      setAmount("");
      setCategory("Food");
      setDate(new Date().toISOString().split("T")[0]);
    } catch (err) {
      console.error("Adding expense failed:", err);
      setError(
        err.message || "Unable to save expense. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete an expense from MongoDB
  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete expense.");
      }

      setExpenses((previousExpenses) =>
        previousExpenses.filter((expense) => expense._id !== id)
      );
    } catch (err) {
      console.error("Deleting expense failed:", err);
      setError(
        err.message || "Unable to delete expense. Please try again."
      );
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">₹</div>
          <span>ExpenseTrack</span>
        </div>

        <p className="menu-heading">MENU</p>

        <div className="nav-item active">
          <span>▦</span> Dashboard
        </div>

        <div className="nav-item">
          <span>↕</span> Transactions
        </div>

        <div className="nav-item">
          <span>◷</span> Reports
        </div>

        <div className="sidebar-bottom">
          <div className="profile-avatar">S</div>
          <div>
            <strong>Student Account - CI/CD- Test</strong>
            <p>Personal Finance</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">PERSONAL FINANCE</p>
            <h1>Dashboard - Test CI/CD</h1>
            <p className="subtitle">
              Track your spending and manage your money.
            </p>
          </div>

          <div className="date-badge">
            <span>◷</span>
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </header>

        {error && (
          <div role="alert" className="error-message">
            {error}
          </div>
        )}

        <section className="summary-grid">
          <div className="summary-card">
            <div className="card-top">
              <span>Total Expenses</span>
              <span className="card-icon purple">₹</span>
            </div>

            <h2>{formatCurrency(totalExpenses)}</h2>
            <p className="card-note">Across all transactions</p>
          </div>

          <div className="summary-card">
            <div className="card-top">
              <span>This Month</span>
              <span className="card-icon green">↗</span>
            </div>

            <h2>{formatCurrency(monthlyExpenses)}</h2>
            <p className="card-note">Expenses for the current month</p>
          </div>

          <div className="summary-card">
            <div className="card-top">
              <span>Transactions</span>
              <span className="card-icon orange">▤</span>
            </div>

            <h2>{expenses.length}</h2>
            <p className="card-note">Total recorded expenses</p>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel expense-panel">
            <div className="panel-heading">
              <div>
                <h2>Add Expense</h2>
                <p>Record a new transaction.</p>
              </div>

              <span className="heading-icon">＋</span>
            </div>

            <form onSubmit={handleAddExpense}>
              <label htmlFor="title">Expense name</label>

              <input
                id="title"
                type="text"
                placeholder="e.g. Lunch, Books, Travel"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />

              <label htmlFor="amount">Amount (₹)</label>

              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />

              <label htmlFor="category">Category</label>

              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option>Food</option>
                <option>Travel</option>
                <option>Shopping</option>
                <option>Education</option>
                <option>Bills</option>
                <option>Entertainment</option>
                <option>Health</option>
                <option>Other</option>
              </select>

              <label htmlFor="date">Date</label>

              <input
                id="date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />

              <button
                className="add-button"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "+ Add Expense"}
              </button>
            </form>
          </div>

          <div className="panel transactions-panel">
            <div className="panel-heading">
              <div>
                <h2>Recent Transactions</h2>
                <p>Your latest recorded expenses.</p>
              </div>

              <span className="transaction-count">
                {expenses.length} records
              </span>
            </div>

            {loading ? (
              <p>Loading expenses...</p>
            ) : expenses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">₹</div>
                <h3>No expenses yet</h3>
                <p>Add your first expense using the form.</p>
              </div>
            ) : (
              <div className="transaction-list">
                {expenses.map((expense) => (
                  <div className="transaction" key={expense._id}>
                    <div className="transaction-icon">
                      {expense.category === "Food"
                        ? "🍽️"
                        : expense.category === "Travel"
                        ? "🚌"
                        : expense.category === "Shopping"
                        ? "🛍️"
                        : expense.category === "Education"
                        ? "📚"
                        : expense.category === "Bills"
                        ? "🧾"
                        : expense.category === "Entertainment"
                        ? "🎬"
                        : expense.category === "Health"
                        ? "💊"
                        : "💰"}
                    </div>

                    <div className="transaction-details">
                      <strong>{expense.title}</strong>
                      <span>
                        {expense.category} · {expense.date}
                      </span>
                    </div>

                    <div className="transaction-right">
                      <strong>{formatCurrency(expense.amount)}</strong>

                      <button
                        className="delete-button"
                        type="button"
                        onClick={() => handleDeleteExpense(expense._id)}
                        aria-label={`Delete ${expense.title}`}
                        title="Delete expense"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer>
          ExpenseTrack · Manage your money, one expense at a time.
        </footer>
      </main>
    </div>
  );
}

export default App;