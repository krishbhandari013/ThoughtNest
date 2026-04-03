// server.js
import express from "express";  // import Express
import cors from "cors";        // import CORS
import dotenv from "dotenv";    // import dotenv
import connectDB from "./config/mongodb.js";

dotenv.config();  // load environment variables from .env
const PORT = process.env.PORT || 5000;

const app = express();


// Middleware
app.use(cors());
app.use(express.json());

 connectDB();
// Test route
app.get("/", (req, res) => {
  res.send("Backend server is running 🚀 using ES Modules");
});

// Server port

// Start server
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});