// src/pages/admin/AdminUsers.jsx
import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [sortBy, setSortBy] = useState("id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.getUsers();
      setUsers(data);
    } catch {
      setError("Users could not be loaded. Please check backend.");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function toggleActive(id) {
    try {
      const res = await adminAPI.toggleUser(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: res.is_active } : u));
      showToast(res.message);
    } catch {
      showToast("❌ Update failed!", "error");
    }
  }

  async function deleteUser(id) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      showToast("🗑️ User deleted successfully!");
    } catch {
      showToast("❌ Delete failed!", "error");
    }
  }

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase();
      const matchSearch = u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.city?.toLowerCase().includes(q);
      const matchFilter = filterActive === "all" ? true : filterActive === "active" ? u.is_active : !u.is_active;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortBy === "name")
        return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "date") {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      return a.id - b.id;
    });

  return (
    <div>
      {toast && (
        <div style={{ ...styles.toast, background: toast.type === "error" ? "rgba(220,53,69,0.9)" : "rgba(76,175,80,0.9)" }}>
          {toast.msg}
        </div>
      )}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>👥 Users Management</h1>
          <p style={styles.subtitle}>Total {users.length} users — {users.filter(u => u.is_active).length} active</p>
        </div>
        <div style={styles.headerRight}>
          <button onClick={fetchUsers} style={styles.refreshBtn}>🔄 Refresh</button>
          <div style={styles.badge}>{filtered.length} results</div>
        </div>
      </div>

      <div style={styles.filterRow}>
        <input placeholder="🔍  Search..." value={search} onChange={e => setSearch(e.target.value)} style={styles.searchInput} />
        <select value={filterActive} onChange={e => setFilterActive(e.target.value)} style={styles.select}>
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={styles.select}>
          <option value="id">Sort: ID</option>
          <option value="name">Sort: Name</option>
          <option value="date">Sort: Date</option>
        </select>
      </div>

      {loading ? (
        <div style={styles.centerBox}>
          <div style={styles.spinner} />
          <p style={{ color: "#8b949e", marginTop: "12px" }}>Loading users...</p>
        </div>
      ) : error ? (
        <div style={styles.errorBox}>
          <p>⚠️ {error}</p>
          <button onClick={fetchUsers} style={styles.retryBtn}>Try Again</button>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["ID", "Name", "Email", "Phone", "City", "Role", "Status", "Actions"].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} style={styles.tr}>
                  <td style={styles.td}><span style={styles.idBadge}>#{user.id}</span></td>
                  <td style={styles.td}>
                    <div style={styles.nameCell}>
                      <div style={styles.avatar}>{user.name?.charAt(0).toUpperCase() || "?"}</div>
                      <span style={styles.userName}>{user.name}</span>
                    </div>
                  </td>
                  <td style={styles.td}><span style={styles.emailText}>{user.email}</span></td>
                  <td style={styles.td}><span style={styles.phoneText}>{user.phone || "—"}</span></td>
                  <td style={styles.td}><span style={styles.cityText}>📍 {user.city || "—"}</span></td>
                  <td style={styles.td}>
                    <span style={{ ...styles.roleBadge, background: user.role === "admin" ? "rgba(233,30,99,0.15)" : "rgba(76,175,80,0.15)", color: user.role === "admin" ? "#e91e63" : "#4CAF50" }}>
                      {user.role === "admin" ? "👑 Admin" : "🌾 Farmer"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.statusBadge, ...(user.is_active ? styles.statusActive : styles.statusInactive) }}>
                      {user.is_active ? "● Active" : "○ Inactive"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionRow}>
                      <button onClick={() => setSelectedUser(user)} style={styles.viewBtn}>👁️</button>
                      <button onClick={() => toggleActive(user.id)} style={styles.toggleBtn}>{user.is_active ? "🔒" : "🔓"}</button>
                      <button onClick={() => deleteUser(user.id)} style={styles.deleteBtn}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "#8b949e" }}>No users found</div>
          )}
        </div>
      )}

      {selectedUser && (
        <div style={styles.modalOverlay} onClick={() => setSelectedUser(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalAvatar}>{selectedUser.name?.charAt(0).toUpperCase()}</div>
              <div>
                <h3 style={styles.modalName}>{selectedUser.name}</h3>
                <p style={styles.modalRole}>{selectedUser.role}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} style={styles.modalClose}>✕</button>
            </div>
            <div style={styles.modalBody}>
              {[
                ["📧 Email", selectedUser.email],
                ["📱 Phone", selectedUser.phone || "—"],
                ["📍 City", selectedUser.city || "—"],
                ["👑 Role", selectedUser.role],
                ["📅 Joined", new Date(selectedUser.created_at).toLocaleDateString()],
                ["⚡ Status", selectedUser.is_active ? "Active" : "Inactive"],
              ].map(([label, val]) => (
                <div key={label} style={styles.modalRow}>
                  <span style={styles.modalLabel}>{label}</span>
                  <span style={styles.modalVal}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: { display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"24px", flexWrap:"wrap", gap:"12px" },
  title: { color:"#e6edf3", fontSize:"24px", fontWeight:"700", margin:0 },
  subtitle: { color:"#8b949e", fontSize:"14px", marginTop:"4px" },
  headerRight: { display:"flex", alignItems:"center", gap:"10px" },
  refreshBtn: { padding:"10px 16px", background:"rgba(76,175,80,0.1)", color:"#4CAF50", border:"1px solid rgba(76,175,80,0.3)", borderRadius:"8px", fontSize:"13px", cursor:"pointer", fontWeight:"600" },
  badge: { background:"rgba(76,175,80,0.15)", color:"#4CAF50", border:"1px solid rgba(76,175,80,0.3)", borderRadius:"20px", padding:"6px 16px", fontSize:"13px", fontWeight:"600" },
  filterRow: { display:"flex", gap:"12px", marginBottom:"20px", flexWrap:"wrap" },
  searchInput: { flex:1, minWidth:"220px", padding:"11px 16px", background:"#161b22", border:"1px solid #30363d", borderRadius:"10px", color:"#c9d1d9", fontSize:"14px", outline:"none" },
  select: { padding:"11px 14px", background:"#161b22", border:"1px solid #30363d", borderRadius:"10px", color:"#c9d1d9", fontSize:"14px", outline:"none", cursor:"pointer" },
  tableWrapper: { background:"#161b22", border:"1px solid #30363d", borderRadius:"14px", overflow:"auto" },
  table: { width:"100%", borderCollapse:"collapse", minWidth:"800px" },
  th: { padding:"13px 16px", color:"#8b949e", fontSize:"12px", fontWeight:"600", textAlign:"left", borderBottom:"1px solid #30363d", background:"#1c2128", textTransform:"uppercase", letterSpacing:"0.5px" },
  tr: { borderBottom:"1px solid #21262d" },
  td: { padding:"13px 16px", verticalAlign:"middle" },
  idBadge: { background:"#21262d", color:"#8b949e", borderRadius:"6px", padding:"3px 8px", fontSize:"12px" },
  nameCell: { display:"flex", alignItems:"center", gap:"10px" },
  avatar: { width:"34px", height:"34px", borderRadius:"50%", background:"linear-gradient(135deg, #4CAF50, #2e7d32)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"700", fontSize:"14px", flexShrink:0 },
  userName: { color:"#e6edf3", fontSize:"14px", fontWeight:"600" },
  emailText: { color:"#c9d1d9", fontSize:"13px" },
  phoneText: { color:"#8b949e", fontSize:"13px" },
  cityText: { color:"#c9d1d9", fontSize:"13px" },
  roleBadge: { borderRadius:"20px", padding:"4px 12px", fontSize:"12px", fontWeight:"600" },
  statusBadge: { borderRadius:"20px", padding:"4px 12px", fontSize:"12px", fontWeight:"600" },
  statusActive: { background:"rgba(76,175,80,0.15)", color:"#4CAF50", border:"1px solid rgba(76,175,80,0.3)" },
  statusInactive: { background:"rgba(100,100,100,0.15)", color:"#8b949e", border:"1px solid rgba(100,100,100,0.2)" },
  actionRow: { display:"flex", gap:"6px" },
  viewBtn: { padding:"6px 10px", background:"rgba(0,188,212,0.1)", border:"1px solid rgba(0,188,212,0.2)", borderRadius:"6px", cursor:"pointer", fontSize:"14px" },
  toggleBtn: { padding:"6px 10px", background:"rgba(255,152,0,0.1)", border:"1px solid rgba(255,152,0,0.2)", borderRadius:"6px", cursor:"pointer", fontSize:"14px" },
  deleteBtn: { padding:"6px 10px", background:"rgba(220,53,69,0.1)", border:"1px solid rgba(220,53,69,0.2)", borderRadius:"6px", cursor:"pointer", fontSize:"14px" },
  centerBox: { textAlign:"center", padding:"60px 20px", background:"#161b22", borderRadius:"14px" },
  spinner: { width:"40px", height:"40px", border:"3px solid #30363d", borderTop:"3px solid #4CAF50", borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto" },
  errorBox: { textAlign:"center", padding:"40px 20px", background:"rgba(220,53,69,0.1)", border:"1px solid rgba(220,53,69,0.2)", borderRadius:"14px", color:"#ff6b6b" },
  retryBtn: { marginTop:"12px", padding:"10px 20px", background:"rgba(220,53,69,0.2)", color:"#ff6b6b", border:"1px solid rgba(220,53,69,0.3)", borderRadius:"8px", cursor:"pointer", fontSize:"14px" },
  modalOverlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"20px" },
  modal: { background:"#161b22", border:"1px solid #30363d", borderRadius:"16px", width:"100%", maxWidth:"420px", overflow:"hidden" },
  modalHeader: { display:"flex", alignItems:"center", gap:"14px", padding:"20px 24px", borderBottom:"1px solid #30363d", background:"#1c2128" },
  modalAvatar: { width:"48px", height:"48px", borderRadius:"50%", background:"linear-gradient(135deg, #4CAF50, #2e7d32)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"700", fontSize:"18px", flexShrink:0 },
  modalName: { color:"#e6edf3", fontSize:"17px", fontWeight:"700", margin:0 },
  modalRole: { color:"#8b949e", fontSize:"13px", margin:"2px 0 0" },
  modalClose: { marginLeft:"auto", background:"transparent", border:"none", color:"#8b949e", fontSize:"18px", cursor:"pointer", padding:"4px 8px" },
  modalBody: { padding:"20px 24px", display:"flex", flexDirection:"column", gap:"12px" },
  modalRow: { display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #21262d" },
  modalLabel: { color:"#8b949e", fontSize:"13px" },
  modalVal: { color:"#c9d1d9", fontSize:"13px", fontWeight:"500" },
  toast: { position:"fixed", top:"20px", right:"20px", color:"#fff", padding:"12px 20px", borderRadius:"10px", fontSize:"14px", fontWeight:"600", zIndex:9999, boxShadow:"0 8px 25px rgba(0,0,0,0.3)" },
};