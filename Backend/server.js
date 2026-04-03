// server.js
import express from "express";  // import Express
import cors from "cors";        // import CORS
import dotenv from "dotenv";    // import dotenv
import connectDB from "./config/mongodb.js";
import userRouter from "./route/userRoute.js";

dotenv.config();  // load environment variables from .env
const PORT = process.env.PORT || 5000;
connectDB();

const app = express();


// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend server is running 🚀 using ES Modules");
});

// Routes
app.use('/api/users', userRouter);

// Server port

// Start server
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});