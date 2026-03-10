import { useEffect, useState } from "react";
import axios from "axios";

function Navbar() {
  const [unseenCount, setUnseenCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Fetch unseen count

  // Fetch notifications list
  const fetchNotifications = async () => {
  const res = await axios.get(
    "http://localhost:8000/api/notifications",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setNotifications(res.data);

  const unseen = res.data.filter(n => !n.seen).length;
  setUnseenCount(unseen);
};

  // When bell clicked
  const toggleNotifications = async () => {
    setShowNotifications(!showNotifications);

    if (!showNotifications) {
      await fetchNotifications();

      // Mark all as seen
      await axios.put(
        "http://localhost:8000/api/notifications/mark-all-seen",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    }
  };

  return (
    <div
      style={{
        padding: "10px 20px",
        borderBottom: "1px solid #444",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
      }}
    >
      <strong>Career Companion</strong>

      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        {/* Notification Bell */}
       <div
  onClick={toggleNotifications}
  style={{
    position: "absolute",
    top: "14px",
    left: "220px",   // aligns next to "Career Companion"
    cursor: "pointer",
    zIndex: 1000,
  }}
>
  🔔
  {unseenCount > 0 && (
    <span
      style={{
        position: "absolute",
        top: "-6px",
        right: "-6px",
        background: "red",
        color: "white",
        borderRadius: "50%",
        padding: "2px 6px",
        fontSize: "12px",
      }}
    >
      {unseenCount}
    </span>
  )}
</div>



        <button
  onClick={handleLogout}
  style={{
    position: "fixed",
    top: "12px",
    right: "12px",
    zIndex: 1000,
  }}
>
  Logout
</button>


      </div>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            right: "-10px",
            width: "300px",
            background: "#222",
            border: "1px solid #444",
            borderRadius: "6px",
            padding: "10px",
            zIndex: 100,
          }}
        >
          <strong>Notifications</strong>
          <hr />

          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                style={{
                  padding: "8px",
                  marginBottom: "5px",
                  background: n.seen ? "#333" : "#444",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              >
                {n.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Navbar;
