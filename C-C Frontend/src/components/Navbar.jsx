import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../config";

function Navbar({ sidebarOpen, toggleSidebar }) {
  const [unseenCount, setUnseenCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userName, setUserName] = useState("");

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
      setUnseenCount(res.data.filter((n) => !n.seen).length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserName(res.data.name || "");
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
    fetchNotifications();
  }, []);

  const toggleNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      await fetchNotifications();
      try {
        await axios.put(
          `${BASE_URL}/api/notifications/mark-all-seen`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUnseenCount(0);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

        .navbar {
          height: 60px;
          padding: 0 24px;
          background: rgba(13,13,15,0.95);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(16px);
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        /* Hamburger Button */
        .hamburger {
          width: 36px;
          height: 36px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 9px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
          flex-shrink: 0;
        }

        .hamburger:hover {
          background: rgba(108,99,255,0.1);
          border-color: rgba(108,99,255,0.25);
        }

        .ham-line {
          width: 16px;
          height: 2px;
          background: #888;
          border-radius: 2px;
          transition: all 0.3s ease;
          transform-origin: center;
        }

        /* Animate lines when open */
        .hamburger.open .ham-line:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
          background: #a09bff;
        }

        .hamburger.open .ham-line:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }

        .hamburger.open .ham-line:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
          background: #a09bff;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          font-family: 'Syne', sans-serif;
          font-size: 17px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.02em;
        }

        .logo-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .nav-greeting {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #555;
        }

        .nav-greeting span {
          color: #aaa;
          font-weight: 600;
        }

        .bell-btn {
          position: relative;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
        }

        .bell-btn:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.15);
        }

        .badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff4757;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 10px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logout-btn {
          padding: 8px 16px;
          background: rgba(255,80,80,0.08);
          border: 1px solid rgba(255,80,80,0.2);
          color: #ff6b6b;
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: rgba(255,80,80,0.15);
          border-color: rgba(255,80,80,0.4);
        }

        .notif-dropdown {
          position: absolute;
          top: 54px;
          right: 28px;
          width: 320px;
          background: #13131a;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 16px;
          z-index: 200;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          animation: fadeDown 0.2s ease;
        }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .notif-title {
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: white;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .notif-item {
          padding: 10px 12px;
          margin-bottom: 6px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #bbb;
          line-height: 1.5;
        }

        .notif-item.unseen {
          background: rgba(108,99,255,0.08);
          border: 1px solid rgba(108,99,255,0.15);
          color: #ddd;
        }

        .notif-item.seen {
          background: rgba(255,255,255,0.03);
          border: 1px solid transparent;
        }

        .notif-empty {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #444;
          text-align: center;
          padding: 20px 0;
        }
      `}</style>

      <nav className="navbar">
        <div className="nav-left">

          {/* Hamburger Toggle */}
          <button
            className={`hamburger ${sidebarOpen ? "open" : ""}`}
            onClick={toggleSidebar}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <span className="ham-line" />
            <span className="ham-line" />
            <span className="ham-line" />
          </button>

          <div className="nav-logo">
            <div className="logo-icon">
              <img src="/logo.jpg" alt="Career Companion" className="logo-img" />
            </div>
            Career Companion
          </div>

        </div>

        <div className="nav-right">
          {userName && (
            <div className="nav-greeting">
              Hey, <span>{userName.split(" ")[0]}</span> 👋
            </div>
          )}

          {/* Bell */}
          <div className="bell-btn" onClick={toggleNotifications}>
            🔔
            {unseenCount > 0 && (
              <span className="badge">{unseenCount}</span>
            )}
          </div>

          {/* Logout */}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="notif-dropdown">
            <div className="notif-title">🔔 Notifications</div>
            {notifications.length === 0 ? (
              <div className="notif-empty">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`notif-item ${n.seen ? "seen" : "unseen"}`}
                >
                  {n.message}
                </div>
              ))
            )}
          </div>
        )}
      </nav>
    </>
  );
}

export default Navbar;