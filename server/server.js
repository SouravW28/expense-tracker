import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.get("/", (req, res) => {
  res.send("Expense Tracker Backend is running!");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Expense Tracker API is working",
  });
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