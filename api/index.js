import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";

dotenv.config(); // load MONGO (and any other) vars from .env

const app = express();
app.use(express.json()); // parse JSON bodies

// Connect to MongoDB Atlas with the new URL parser and unified topology
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");

    // Only start listening once the DB is up
    app.listen(3000, () => {
      console.log("🚀 Server running on port 3000");
    });
  })
  .catch((err) => {
    // Print a concise error and exit (so you notice immediately)
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Mount your routers
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);

// Central error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || "Internal Server Error",
  });
});
