// // src/pages/AdminPanel.jsx
// import { useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// import AdminStats from "./admin/AdminStats";
// import AdminUsers from "./admin/AdminUsers";
// import AdminMandi from "./admin/AdminMandi";
// import AdminFeedback from "./admin/AdminFeedback";
// import AdminReviews from "./admin/AdminReviews";

// export default function AdminPanel() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const navItems = [
//     { path: "/admin", label: "📊 Stats", exact: true },
//     { path: "/admin/users", label: "👥 Users" },
//     { path: "/admin/mandi", label: "💰 Mandi Prices" },
//     { path: "/admin/feedback", label: "📬 Feedback" },
//     { path: "/admin/reviews", label: "⭐ Reviews" },
//   ];

//   const isActive = (path, exact) => {
//     if (exact) return location.pathname === path;
//     return location.pathname.startsWith(path);
//   };

//   function handleLogout() {
//     logout();
//     navigate("/auth");
//   }

//   const renderPage = () => {
//     if (location.pathname === "/admin" || location.pathname === "/admin/") {
//       return <AdminStats />;
//     }
//     if (location.pathname.startsWith("/admin/users")) {
//       return <AdminUsers />;
//     }
//     if (location.pathname.startsWith("/admin/mandi")) {
//       return <AdminMandi />;
//     }
//     if (location.pathname.startsWith("/admin/feedback")) {
//       return <AdminFeedback />;
//     }
//     if (location.pathname.startsWith("/admin/reviews")) {
//       return <AdminReviews />;
//     }
//     return <AdminStats />;
//   };

//   return (
//     <div style={styles.wrapper}>
//       {/* Sidebar */}
//       <aside style={styles.sidebar}>
//         <div style={styles.sidebarHeader}>
//           <div style={styles.sidebarLogo}>🌾</div>
//           <div>
//             <div style={styles.sidebarTitle}>KisanAI</div>
//             <div style={styles.sidebarSub}>Admin Panel</div>
//           </div>
//         </div>

//         <div style={styles.adminInfo}>
//           <div style={styles.adminAvatar}>
//             {user?.name?.charAt(0).toUpperCase() || "A"}
//           </div>
//           <div>
//             <div style={styles.adminName}>{user?.name || "Admin"}</div>
//             <div style={styles.adminRole}>👑 Administrator</div>
//           </div>
//         </div>

//         <nav style={styles.nav}>
//           {navItems.map((item) => (
//             <button
//               key={item.path}
//               onClick={() => navigate(item.path)}
//               style={{
//                 ...styles.navItem,
//                 ...(isActive(item.path, item.exact)
//                   ? styles.navItemActive
//                   : {}),
//               }}
//             >
//               {item.label}
//             </button>
//           ))}
//         </nav>

//         <div style={styles.sidebarFooter}>
//           <button onClick={() => navigate("/")} style={styles.footerBtn}>
//             🏠 Go to App
//           </button>
//           <button onClick={handleLogout} style={styles.logoutBtn}>
//             🚪 Logout
//           </button>
//         </div>
//       </aside>

//       {/* MAIN CONTENT */}
//       <main style={styles.main}>{renderPage()}</main>
//     </div>
//   );
// }

// const styles = {
//   wrapper: {
//     display: "flex",
//     minHeight: "100vh",
//     background: "#0f1117",
//     fontFamily: "'Segoe UI', sans-serif",
//   },

//   sidebar: {
//     width: "240px",
//     minHeight: "100vh",
//     background: "#161b22",
//     borderRight: "1px solid #30363d",
//     display: "flex",
//     flexDirection: "column",
//   },

//   sidebarHeader: {
//     display: "flex",
//     alignItems: "center",
//     gap: "12px",
//     padding: "24px 20px",
//     borderBottom: "1px solid #30363d",
//   },

//   sidebarLogo: { fontSize: "32px" },
//   sidebarTitle: { color: "#e6edf3", fontWeight: "700", fontSize: "16px" },
//   sidebarSub: { color: "#8b949e", fontSize: "11px" },

//   adminInfo: {
//     display: "flex",
//     alignItems: "center",
//     gap: "10px",
//     padding: "16px 20px",
//     borderBottom: "1px solid #30363d",
//     background: "rgba(76,175,80,0.05)",
//   },

//   adminAvatar: {
//     width: "36px",
//     height: "36px",
//     borderRadius: "50%",
//     background: "linear-gradient(135deg,#4CAF50,#2e7d32)",
//     color: "#fff",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontWeight: "700",
//   },

//   adminName: { color: "#e6edf3", fontSize: "13px", fontWeight: "600" },
//   adminRole: { color: "#4CAF50", fontSize: "11px" },

//   nav: {
//     padding: "16px 12px",
//     display: "flex",
//     flexDirection: "column",
//     gap: "4px",
//     flex: 1,
//   },

//   navItem: {
//     padding: "11px 14px",
//     background: "transparent",
//     color: "#8b949e",
//     border: "none",
//     borderRadius: "8px",
//     textAlign: "left",
//     cursor: "pointer",
//   },

//   navItemActive: {
//     background: "rgba(76,175,80,0.15)",
//     color: "#4CAF50",
//     fontWeight: "600",
//   },

//   sidebarFooter: {
//     padding: "16px 12px",
//     borderTop: "1px solid #30363d",
//     display: "flex",
//     flexDirection: "column",
//     gap: "8px",
//   },

//   footerBtn: {
//     padding: "10px 14px",
//     background: "transparent",
//     color: "#8b949e",
//     border: "1px solid #30363d",
//     borderRadius: "8px",
//   },

//   logoutBtn: {
//     padding: "10px 14px",
//     background: "rgba(220,53,69,0.1)",
//     color: "#ff6b6b",
//     border: "1px solid rgba(220,53,69,0.2)",
//     borderRadius: "8px",
//   },

//   main: {
//     flex: 1,
//     padding: "32px",
//     background: "#0d1117",
//     overflow: "auto",
//   },
// };








// src/pages/AdminPanel.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import axios from "axios";

import AdminStats from "./admin/AdminStats";
import AdminUsers from "./admin/AdminUsers";
import AdminMandi from "./admin/AdminMandi";
import AdminFeedback from "./admin/AdminFeedback";
import AdminReviews from "./admin/AdminReviews";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Change Password Component ─────────────────────────────────────
function ChangePassword({ token }) {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const strength = (p) => {
    if (!p) return { label: "", color: "#30363d", width: "0%" };
    if (p.length < 6)  return { label: "Too Short", color: "#ef4444", width: "25%" };
    if (p.length < 8)  return { label: "Weak",      color: "#f97316", width: "50%" };
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p))
                       return { label: "Medium",    color: "#eab308", width: "75%" };
    return               { label: "Strong",     color: "#22c55e", width: "100%" };
  };
  const pwd = strength(form.new_password);

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); setSuccess(false);
  };

  const submit = async () => {
    if (!form.current_password) { setError("Please enter your current password"
); return; }
    if (form.new_password.length < 8) { setError("New password must be at least 8 characters"
); return; }
    if (form.new_password !== form.confirm_password) { setError("Passwords do not match"); return; }
    setLoading(true); setError("");
    try {
      await axios.post(
        `${API}/api/admin/change-password`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (e) {
      setError(e.response?.data?.detail || "Something went wrong — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: "#e6edf3", fontSize: 20, fontWeight: 700, margin: 0 }}>🔐 Change Password</h2>
        <p style={{ color: "#8b949e", fontSize: 13, marginTop: 6 }}>"Change your password without going to the database"</p>
      </div>

      <div style={{ maxWidth: 460 }}>

        {success && (
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: "16px", marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
            <div style={{ color: "#22c55e", fontWeight: 700 }}>Password Successfully Changed!</div>
            <div style={{ color: "#8b949e", fontSize: 13, marginTop: 4 }}>Confirmation email bhej di gayi hai.</div>
          </div>
        )}

        <div style={{ background: "#161b22", borderRadius: 16, padding: 24, border: "1px solid #30363d" }}>

          {/* Current Password */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Current Password</label>
            <div style={{ position: "relative" }}>
              <input
                name="current_password"
                type={show.current ? "text" : "password"}
                value={form.current_password}
                onChange={handle}
                placeholder="Enter your current password"
                style={inp}
              />
              <button onClick={() => setShow(s => ({ ...s, current: !s.current }))} style={eye}>
                {show.current ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div style={{ borderTop: "1px dashed #30363d", margin: "16px 0" }} />

          {/* New Password */}
          <div style={{ marginBottom: 10 }}>
            <label style={lbl}>New Password</label>
            <div style={{ position: "relative" }}>
              <input
                name="new_password"
                type={show.new ? "text" : "password"}
                value={form.new_password}
                onChange={handle}
                placeholder="Minimum 8 characters"
                style={inp}
              />
              <button onClick={() => setShow(s => ({ ...s, new: !s.new }))} style={eye}>
                {show.new ? "🙈" : "👁️"}
              </button>
            </div>
            {form.new_password && (
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 4, background: "#0d1117", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: pwd.width, background: pwd.color, borderRadius: 2, transition: "all 0.3s" }} />
                </div>
                <div style={{ fontSize: 11, color: pwd.color, fontWeight: 600, marginTop: 4 }}>{pwd.label}</div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Confirm New Password</label>
            <div style={{ position: "relative" }}>
              <input
                name="confirm_password"
                type={show.confirm ? "text" : "password"}
                value={form.confirm_password}
                onChange={handle}
                placeholder="Re-enter new password"
                style={{
                  ...inp,
                  borderColor: form.confirm_password
                    ? form.confirm_password === form.new_password ? "#22c55e" : "#ef4444"
                    : "#30363d",
                }}
              />
              <button onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))} style={eye}>
                {show.confirm ? "🙈" : "👁️"}
              </button>
            </div>
            {form.confirm_password && (
              <div style={{ fontSize: 11, marginTop: 4, color: form.confirm_password === form.new_password ? "#22c55e" : "#ef4444" }}>
                {form.confirm_password === form.new_password ? "✓ Passwords match" : "⚠️ Passwords match nahi kar rahe"}
              </div>
            )}
          </div>

          {/* Tips */}
          <div style={{ background: "rgba(76,175,80,0.05)", border: "1px solid rgba(76,175,80,0.1)", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 12, color: "#8b949e", lineHeight: 1.8 }}>
            <div style={{ color: "#4CAF50", fontWeight: 700, marginBottom: 4 }}>💡 Strong password tips:</div>
            <div>• 8+ characters</div>
            <div>• Uppercase letters (A-Z)</div>
            <div>• Numbers (0-9)</div>
            <div>• Symbols (!@#$)</div>
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", color: "#ff6b6b", fontSize: 13, marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={loading}
            style={{
              width: "100%", padding: "13px", borderRadius: 12, border: "none",
              background: loading ? "#30363d" : "linear-gradient(135deg,#2e7d32,#4CAF50)",
              color: "white", fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}
          >
            {loading
              ? <><div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Changing...</>
              : "🔐 Change Password"
            }
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

const lbl = { display: "block", fontSize: 13, fontWeight: 600, color: "#8b949e", marginBottom: 8 };
const inp = { display: "block", width: "100%", padding: "11px 40px 11px 14px", borderRadius: 10, border: "1px solid #30363d", background: "#0d1117", color: "#e6edf3", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
const eye = { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 4 };

// ── Main AdminPanel ───────────────────────────────────────────────
export default function AdminPanel() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/admin",          label: "📊 Stats",         exact: true },
    { path: "/admin/users",    label: "👥 Users"                      },
    { path: "/admin/mandi",    label: "💰 Mandi Prices"               },
    { path: "/admin/feedback", label: "📬 Feedback"                   },
    { path: "/admin/reviews",  label: "⭐ Reviews"                    },
    { path: "/admin/password", label: "🔐 Change Password"            },
  ];

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  function handleLogout() {
    logout();
    navigate("/auth");
  }

  const renderPage = () => {
    if (location.pathname === "/admin" || location.pathname === "/admin/")
      return <AdminStats />;
    if (location.pathname.startsWith("/admin/users"))
      return <AdminUsers />;
    if (location.pathname.startsWith("/admin/mandi"))
      return <AdminMandi />;
    if (location.pathname.startsWith("/admin/feedback"))
      return <AdminFeedback />;
    if (location.pathname.startsWith("/admin/reviews"))
      return <AdminReviews />;
    if (location.pathname.startsWith("/admin/password"))
      return <ChangePassword token={token} />;
    return <AdminStats />;
  };

  return (
    <div style={styles.wrapper}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.sidebarLogo}>🌾</div>
          <div>
            <div style={styles.sidebarTitle}>KisanAI</div>
            <div style={styles.sidebarSub}>Admin Panel</div>
          </div>
        </div>

        <div style={styles.adminInfo}>
          <div style={styles.adminAvatar}>
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div>
            <div style={styles.adminName}>{user?.name || "Admin"}</div>
            <div style={styles.adminRole}>👑 Administrator</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                ...styles.navItem,
                ...(isActive(item.path, item.exact) ? styles.navItemActive : {}),
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={() => navigate("/")} style={styles.footerBtn}>
            🏠 Go to App
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>{renderPage()}</main>
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", minHeight: "100vh", background: "#0f1117", fontFamily: "'Segoe UI', sans-serif" },
  sidebar: { width: "240px", minHeight: "100vh", background: "#161b22", borderRight: "1px solid #30363d", display: "flex", flexDirection: "column" },
  sidebarHeader: { display: "flex", alignItems: "center", gap: "12px", padding: "24px 20px", borderBottom: "1px solid #30363d" },
  sidebarLogo: { fontSize: "32px" },
  sidebarTitle: { color: "#e6edf3", fontWeight: "700", fontSize: "16px" },
  sidebarSub: { color: "#8b949e", fontSize: "11px" },
  adminInfo: { display: "flex", alignItems: "center", gap: "10px", padding: "16px 20px", borderBottom: "1px solid #30363d", background: "rgba(76,175,80,0.05)" },
  adminAvatar: { width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#4CAF50,#2e7d32)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" },
  adminName: { color: "#e6edf3", fontSize: "13px", fontWeight: "600" },
  adminRole: { color: "#4CAF50", fontSize: "11px" },
  nav: { padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px", flex: 1 },
  navItem: { padding: "11px 14px", background: "transparent", color: "#8b949e", border: "none", borderRadius: "8px", textAlign: "left", cursor: "pointer", fontFamily: "inherit", fontSize: "14px" },
  navItemActive: { background: "rgba(76,175,80,0.15)", color: "#4CAF50", fontWeight: "600" },
  sidebarFooter: { padding: "16px 12px", borderTop: "1px solid #30363d", display: "flex", flexDirection: "column", gap: "8px" },
  footerBtn: { padding: "10px 14px", background: "transparent", color: "#8b949e", border: "1px solid #30363d", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" },
  logoutBtn: { padding: "10px 14px", background: "rgba(220,53,69,0.1)", color: "#ff6b6b", border: "1px solid rgba(220,53,69,0.2)", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" },
  main: { flex: 1, padding: "32px", background: "#0d1117", overflow: "auto" },
};