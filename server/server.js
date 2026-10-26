import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";

const app = express();

app.use(cors({
  origin: "https://expense-tracker-frontend-wf4n.onrender.com",
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/expensetracker";

// Expense Schema & Model
const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true, default: "Food" },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

const Expense = mongoose.model("Expense", expenseSchema);

app.get("/", (req, res) => {
  res.send("Expense Tracker Backend is running!");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Expense Tracker API is working",
  });
});

// GET all expenses
app.get("/api/expenses", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1, createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create expense
app.post("/api/expenses", async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    if (!title || amount === undefined || !date) {
      return res.status(400).json({
        success: false,
        message: "Title, amount, and date are required.",
      });
    }

    const newExpense = new Expense({
      title,
      amount: Number(amount),
      category: category || "Other",
      date,
    });

    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE expense by ID
app.delete("/api/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExpense = await Expense.findByIdAndDelete(id);
    if (!deletedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }
    res.json({
      success: true,
      message: "Expense deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start only after MongoDB connects
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected successfully!");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();