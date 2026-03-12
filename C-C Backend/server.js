require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
app.use(express.json());
connectDB();

// CORS — allow local dev + deployed frontend
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Root route
app.get("/", (req, res) => {
  res.send("Career Companion Backend is running ✅");
});

// Routes
const authRoutes = require("./Routes/authRoutes");
const userRoutes = require("./Routes/userroute");
const jobRoutes = require("./Routes/jobroute");
const notificationRoutes = require("./Routes/notificationRoutes");
const resumeRoutes = require("./Routes/resumeRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/resume", resumeRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});