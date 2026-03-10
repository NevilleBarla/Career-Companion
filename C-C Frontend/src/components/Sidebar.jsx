import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard/home", icon: "🏠", label: "Home" },
  { to: "/dashboard/recommended-jobs", icon: "🎯", label: "Recommended Jobs" },
  { to: "/dashboard/available-jobs", icon: "💼", label: "Available Jobs" },
  { to: "/dashboard/resume", icon: "📄", label: "Resume Analyzer" },
  { to: "/dashboard/profile", icon: "👤", label: "Profile" },
];

function Sidebar({ isOpen }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

        .sidebar {
          width: 220px;
          min-height: calc(100vh - 60px);
          background: rgba(13,13,15,0.8);
          border-right: 1px solid rgba(255,255,255,0.06);
          padding: 24px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          position: sticky;
          top: 60px;
          height: calc(100vh - 60px);
          overflow: hidden;
          transition: width 0.3s ease, padding 0.3s ease;
          flex-shrink: 0;
        }

        /* Collapsed state */
        .sidebar.collapsed {
          width: 64px;
          padding: 24px 10px;
        }

        .sidebar-section-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 600;
          color: #333;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0 10px;
          margin-bottom: 8px;
          margin-top: 4px;
          white-space: nowrap;
          overflow: hidden;
          transition: opacity 0.2s ease;
        }

        .sidebar.collapsed .sidebar-section-label {
          opacity: 0;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border-radius: 10px;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #555;
          transition: all 0.2s ease;
          border: 1px solid transparent;
          white-space: nowrap;
          overflow: hidden;
        }

        .sidebar-link:hover {
          background: rgba(255,255,255,0.04);
          color: #aaa;
        }

        .sidebar-link.active {
          background: rgba(108,99,255,0.12);
          border-color: rgba(108,99,255,0.2);
          color: #a09bff;
          font-weight: 600;
        }

        /* Collapsed: center icons */
        .sidebar.collapsed .sidebar-link {
          padding: 10px;
          justify-content: center;
          gap: 0;
        }

        .sidebar-icon {
          font-size: 18px;
          width: 22px;
          text-align: center;
          flex-shrink: 0;
        }

        .sidebar-label {
          transition: opacity 0.2s ease, width 0.3s ease;
          overflow: hidden;
        }

        .sidebar.collapsed .sidebar-label {
          opacity: 0;
          width: 0;
        }

        /* Tooltip on collapsed hover */
        .sidebar-link-wrapper {
          position: relative;
        }

        .sidebar-link-wrapper .tooltip {
          display: none;
          position: absolute;
          left: 56px;
          top: 50%;
          transform: translateY(-50%);
          background: #1e1e2e;
          border: 1px solid rgba(255,255,255,0.1);
          color: #ccc;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          padding: 5px 10px;
          border-radius: 7px;
          white-space: nowrap;
          z-index: 999;
          pointer-events: none;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        }

        .sidebar.collapsed .sidebar-link-wrapper:hover .tooltip {
          display: block;
        }

        .sidebar-bottom {
          margin-top: auto;
          padding: 14px 10px;
          border-top: 1px solid rgba(255,255,255,0.05);
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          color: #2a2a2a;
          text-align: center;
          line-height: 1.6;
          white-space: nowrap;
          overflow: hidden;
          transition: opacity 0.2s ease;
        }

        .sidebar.collapsed .sidebar-bottom {
          opacity: 0;
        }
      `}</style>

      <div className={`sidebar ${isOpen ? "" : "collapsed"}`}>
        <div className="sidebar-section-label">Navigation</div>

        {navItems.map((item) => (
          <div className="sidebar-link-wrapper" key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link${isActive ? " active" : ""}`
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
            {/* Tooltip shown only when collapsed */}
            <span className="tooltip">{item.label}</span>
          </div>
        ))}

        <div className="sidebar-bottom">
          Career Companion<br />AI-Powered Platform
        </div>
      </div>
    </>
  );
}

export default Sidebar;