require("dotenv").config({ path: __dirname + "/.env" });
console.log("GROQ:", process.env.GROQ_API_KEY ? "✅ Loaded" : "❌ Missing");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./Routes/userroute");



const app = express();
app.use(express.json());
connectDB();

// Enable CORS
app.use(cors({
  origin: "http://localhost:5173"
}));

// Root route
app.get("/", (req, res) => {
  res.send("Career Companion Backend is running");
});

// Auth routes
const authRoutes = require("./Routes/authRoutes");
app.use("/api/auth", authRoutes);

// User routes
app.use("/api/user", userRoutes);

// Job routes
const jobRoutes = require("./Routes/jobroute");
app.use("/api/jobs", jobRoutes);

// Notification routes
const notificationRoutes = require("./Routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

// Resume routes
const resumeRoutes = require("./Routes/resumeRoutes");
app.use("/api/resume", resumeRoutes);

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});