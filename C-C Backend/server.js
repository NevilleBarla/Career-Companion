const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./Routes/userroute");



const app = express();
app.use(express.json());
connectDB();

// Enable CORS for a specific origin
app.use(cors({
  origin: "http://localhost:5173"
}));



// Import auth routes
const authRoutes = require("./Routes/authRoutes");
app.use("/api/auth", authRoutes);

// Import job routes
const jobRoutes = require("./Routes/jobroute");

// Root route
app.get("/", (req, res) => {
  res.send("Career Companion Backend is running");
});

// Import user routes
app.use("/api/user", userRoutes);

// Import notification routes
const notificationRoutes = require("./Routes/notificationRoutes");


// Use job routes
app.use("/api/jobs", jobRoutes);

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
app.use("/api/notifications", notificationRoutes);


