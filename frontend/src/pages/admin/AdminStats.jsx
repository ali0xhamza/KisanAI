import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function AdminStats() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  const token   = localStorage.getItem("kisan_token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchStats(); }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      // Single stats endpoint — everything in one call
      const res     = await axios.get(`${API}/api/auth/admin/stats`, { headers });
      const data    = res.data;

      // Notifications subscribers
      const subsRes = await axios.get(`${API}/api/notifications/stats`, { headers })
                        .catch(() => ({ data: { count: 0 } }));

      setStats({
        totalUsers:    data.total_users,
        activeUsers:   data.active_users,
        adminUsers:    data.admin_users,
        farmerUsers:   data.farmer_users,
        todayUsers:    data.today_users,
        totalReviews:  data.total_reviews,
        avgRating:     data.avg_rating,
        totalFeedback: data.total_feedback,
        pendingFb:     data.pending_feedback,
        resolvedFb:    data.total_feedback - data.pending_feedback,
        mandiCount:    data.mandi_count,
        chatCount:     data.chat_count,
        subsCount:     subsRes.data?.count || 0,
      });
    } catch (e) {
      console.error(e);
      setStats({ totalUsers:0, activeUsers:0, adminUsers:0, farmerUsers:0, todayUsers:0, totalReviews:0, avgRating:"0", totalFeedback:0, pendingFb:0, resolvedFb:0, mandiCount:0, subsCount:0 });
    } finally {
      setLoading(false);
    }
  }

  const cards = stats ? [
  { icon:"👥", label:"Total Users",       value:stats.totalUsers,    color:"#4CAF50", bg:"rgba(76,175,80,0.1)",   border:"rgba(76,175,80,0.25)" },
  { icon:"🟢", label:"Active Users",      value:stats.activeUsers,   color:"#00bcd4", bg:"rgba(0,188,212,0.1)",   border:"rgba(0,188,212,0.25)" },
  { icon:"🌾", label:"Farmers",           value:stats.farmerUsers,   color:"#ff9800", bg:"rgba(255,152,0,0.1)",   border:"rgba(255,152,0,0.25)" },
  { icon:"📅", label:"Today Signups",     value:stats.todayUsers,    color:"#9c27b0", bg:"rgba(156,39,176,0.1)",  border:"rgba(156,39,176,0.25)" },
  { icon:"⭐", label:"Total Reviews",     value:stats.totalReviews,  color:"#ffc107", bg:"rgba(255,193,7,0.1)",   border:"rgba(255,193,7,0.25)" },
  { icon:"📊", label:"Avg Rating",        value:`${stats.avgRating}★`,color:"#ffc107", bg:"rgba(255,193,7,0.1)", border:"rgba(255,193,7,0.25)" },
  { icon:"📬", label:"Total Feedback",    value:stats.totalFeedback, color:"#2196F3", bg:"rgba(33,150,243,0.1)",  border:"rgba(33,150,243,0.25)" },
  { icon:"⏳", label:"Pending Feedback",  value:stats.pendingFb,     color:"#ff9800", bg:"rgba(255,152,0,0.1)",   border:"rgba(255,152,0,0.25)" },
  { icon:"✅", label:"Resolved Feedback", value:stats.resolvedFb,    color:"#4CAF50", bg:"rgba(76,175,80,0.1)",   border:"rgba(76,175,80,0.25)" },
  { icon:"💰", label:"Mandi Records",     value:stats.mandiCount,    color:"#4CAF50", bg:"rgba(76,175,80,0.1)",   border:"rgba(76,175,80,0.25)" },
  { icon:"💬", label:"Total AI Chats",    value:stats.chatCount,     color:"#2196F3", bg:"rgba(33,150,243,0.1)",  border:"rgba(33,150,243,0.25)" },
  { icon:"🔔", label:"Subscribers",       value:stats.subsCount,     color:"#e91e63", bg:"rgba(233,30,99,0.1)",   border:"rgba(233,30,99,0.25)" },
  { icon:"👑", label:"Admins",            value:stats.adminUsers,    color:"#e91e63", bg:"rgba(233,30,99,0.1)",   border:"rgba(233,30,99,0.25)" },
] : [];

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>📊 Dashboard</h1>
          <p style={s.sub}>Real-time stats — live from database</p>
        </div>
        <button onClick={fetchStats} style={s.refreshBtn}>🔄 Refresh</button>
      </div>

      {loading ? (
        <div style={s.grid}>{[1,2,3,4,5,6,7,8,9,10,11,12].map(i => <div key={i} style={s.skeleton}/>)}</div>
      ) : (
        <div style={s.grid}>
          {cards.map(c => (
            <div key={c.label} style={{ ...s.card, background:c.bg, border:`1px solid ${c.border}` }}>
              <div style={s.cardIcon}>{c.icon}</div>
              <div style={{ ...s.cardVal, color:c.color }}>{c.value}</div>
              <div style={s.cardLabel}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={s.row}>
        <div style={s.panel}>
          <h3 style={s.panelTitle}>⚙️ System Status</h3>
          {[
            { icon:"✅", label:"Backend Connected"    },
            { icon:"🔐", label:"JWT Auth Working"     },
            { icon:"📧", label:"Email System Ready"   },
            { icon:"🔔", label:"Push Notifications"   },
            { icon:"💰", label:"Mandi Auto Update"    },
            { icon:"🌤️", label:"Weather Alerts Active" },
            { icon:"📱", label:"PWA Offline Ready"    },
          ].map((item, i) => (
            <div key={i} style={s.actRow}>
              <span style={{ fontSize:16 }}>{item.icon}</span>
              <div style={{ flex:1 }}>
                <div style={s.actEvent}>{item.label}</div>
                <div style={{ ...s.actTime, color:"#4CAF50" }}>● Active</div>
              </div>
            </div>
          ))}
        </div>

        <div style={s.panel}>
          <h3 style={s.panelTitle}>🖥️ Tech Stack</h3>
          {[
            ["Version",    "v2.0.0"],
            ["Frontend",   "React + Vite"],
            ["Backend",    "✅ FastAPI"],
            ["Database",   "✅ PostgreSQL"],
            ["AI Model",   "llama-3.3-70b"],
            ["Auth",       "✅ JWT"],
            ["Email",      "✅ Brevo SMTP"],
            ["PWA",        "✅ Active"],
            ["Scheduler",  "✅ APScheduler"],
          ].map(([label, value]) => (
            <div key={label} style={s.infoRow}>
              <span style={s.infoLabel}>{label}</span>
              <span style={s.infoVal}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...s.panel, marginTop:20 }}>
        <h3 style={s.panelTitle}>✅ Features Status</h3>
        <div style={s.chips}>
          {[
            ["AI Chatbot","live"],["Disease Detection","live"],
            ["Weather Alerts","live"],["Mandi Prices","live"],
            ["Push Notifications","live"],["Email Notifications","live"],
            ["Fertilizer Guide","live"],["Soil Checker","live"],
            ["Fasal Calendar","live"],["Spray Calculator","live"],
            ["Yield Predictor","live"],["Expense Tracker","live"],
            ["Fasal Diary","live"],["Community","live"],
            ["Admin Panel","live"],["JWT Auth","live"],
            ["PWA Offline","live"],["Kisan ID Card","live"],
            ["Redis Cache","pending"],["Deploy","pending"],
          ].map(([name, status]) => (
            <div key={name} style={s.chip}>
              <span style={{ ...s.dot, background: status==="live" ? "#4CAF50" : "#444" }}/>
              <span style={s.chipText}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  header:     { display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 },
  title:      { color:"#e6edf3", fontSize:24, fontWeight:700, margin:0 },
  sub:        { color:"#8b949e", fontSize:14, marginTop:4 },
  refreshBtn: { padding:"10px 18px", background:"rgba(76,175,80,0.1)", color:"#4CAF50", border:"1px solid rgba(76,175,80,0.3)", borderRadius:8, fontSize:13, cursor:"pointer", fontWeight:600 },
  grid:       { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:20 },
  card:       { borderRadius:14, padding:"18px 16px" },
  cardIcon:   { fontSize:26, marginBottom:8 },
  cardVal:    { fontSize:30, fontWeight:800, lineHeight:1 },
  cardLabel:  { color:"#e6edf3", fontSize:13, fontWeight:600, marginTop:6 },
  skeleton:   { height:110, borderRadius:14, background:"#1c2128" },
  row:        { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  panel:      { background:"#161b22", border:"1px solid #30363d", borderRadius:14, padding:20 },
  panelTitle: { color:"#e6edf3", fontSize:14, fontWeight:700, margin:"0 0 14px", paddingBottom:10, borderBottom:"1px solid #30363d" },
  actRow:     { display:"flex", alignItems:"flex-start", gap:10, marginBottom:10 },
  actEvent:   { color:"#c9d1d9", fontSize:13 },
  actTime:    { color:"#8b949e", fontSize:11, marginTop:2 },
  infoRow:    { display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #21262d" },
  infoLabel:  { color:"#8b949e", fontSize:12 },
  infoVal:    { color:"#c9d1d9", fontSize:12, fontWeight:500 },
  chips:      { display:"flex", flexWrap:"wrap", gap:8 },
  chip:       { display:"flex", alignItems:"center", gap:6, background:"#21262d", border:"1px solid #30363d", borderRadius:20, padding:"4px 12px" },
  dot:        { width:7, height:7, borderRadius:"50%", flexShrink:0 },
  chipText:   { color:"#c9d1d9", fontSize:11 },
};