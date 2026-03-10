import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import Home from "./dashboard/Home";
import RecommendedJobs from "./dashboard/RecommendedJobs";
import AvailableJobs from "./dashboard/AvailableJobs";
import ResumeAnalyzer from "./dashboard/ResumeAnalyzer";
import Profile from "./dashboard/Profile";

function Dashboard() {
  return (
    <div>
      <Navbar />

      <div style={{ display: "flex" }}>
        <Sidebar />

        <div style={{ padding: "20px", flex: 1 }}>
          <Routes>
            <Route path="/" element={<Navigate to="home" />} />
            <Route path="home" element={<Home />} />
            <Route path="recommended-jobs" element={<RecommendedJobs />} />
            <Route path="available-jobs" element={<AvailableJobs />} />
            <Route path="resume" element={<ResumeAnalyzer />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;


