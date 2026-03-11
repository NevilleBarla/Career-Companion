import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import Home from "./dashboard/Home";
import RecommendedJobs from "./dashboard/RecommendedJobs";
import AvailableJobs from "./dashboard/AvailableJobs";
import ResumeAnalyzer from "./dashboard/ResumeAnalyzer";
import Profile from "./dashboard/Profile";
import ApplicationTracker from "./dashboard/ApplicationTracker";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ background: "#0d0d0f", minHeight: "100vh", color: "white" }}>

      {/* Navbar receives toggle function */}
      <Navbar
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <div style={{ display: "flex" }}>

        {/* Sidebar receives open state */}
        <Sidebar isOpen={sidebarOpen} />

        {/* Main content shifts smoothly */}
        <div
          style={{
            flex: 1,
            padding: "32px 36px",
            background: "#0d0d0f",
            minHeight: "calc(100vh - 60px)",
            overflowY: "auto",
            transition: "margin-left 0.3s ease",
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="home" />} />
            <Route path="home" element={<Home />} />
            <Route path="recommended-jobs" element={<RecommendedJobs />} />
            <Route path="available-jobs" element={<AvailableJobs />} />
            <Route path="resume" element={<ResumeAnalyzer />} />
            <Route path="tracker" element={<ApplicationTracker />} />
            <Route path="profile" element={<Profile />} />
              
          </Routes>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;