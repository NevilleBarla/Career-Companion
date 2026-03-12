import "./index.css"; // ✅ Must be first import
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { GoogleOAuthProvider } from "@react-oauth/google";

// Clear session on tab/browser close — forces login every new session
window.addEventListener("beforeunload", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("resumeAnalysis");
  localStorage.removeItem("availableJobsCache");
  localStorage.removeItem("recommendedJobsCache");
  sessionStorage.removeItem("splashShown");
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="386655448443-pm20b27em1k0rtmkmfkq38egma3q2mgi.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);