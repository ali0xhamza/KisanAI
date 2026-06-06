import { useState, useEffect } from "react";
import axios from "axios";
import { adminAPI } from "../../services/api";

const API = import.meta.env.VITE_API_URL;

const TYPE_COLORS = {
  bug:       { bg: "rgba(220,53,69,0.1)",  color: "#ff6b6b", label: "🐛 Bug Report" },
  feature:   { bg: "rgba(255,193,7,0.1)",  color: "#ffc107", label: "💡 Feature Request" },
  feedback:  { bg: "rgba(76,175,80,0.1)",  color: "#4CAF50", label: "👍 General Feedback" },
  complaint: { bg: "rgba(255,152,0,0.1)",  color: "#ff9800", label: "⚠️ Complaint" },
};

const PER_PAGE = 6;

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState("all");
  const [resolvingId, setResolvingId] = useState(null);
  const [deletingId, setDeletingId]   = useState(null);
  const [successId, setSuccessId]   = useState(null);
  const [page, setPage]             = useState(1);

  const token   = localStorage.getItem("kisan_token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchFeedbacks(); }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/user-feedback/`, { headers });
      setFeedbacks(res.data);
    } catch {
      console.error("Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  };

  const resolve = async (id) => {
    setResolvingId(id);
    try {
      await axios.patch(`${API}/api/user-feedback/${id}/resolve`, {}, { headers });
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, is_resolved: true } : f));
      setSuccessId(id);
      setTimeout(() => setSuccessId(null), 3000);
    } catch {
      alert("Failed to resolve — please try again");
    } finally {
      setResolvingId(null);
    }
  };

  // DELETE handler – uses adminAPI (already working)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this feedback?")) return;
    setDeletingId(id);
    try {
      await adminAPI.deleteReview(id);   // calls `DELETE /api/feedback/admin/${id}`
      setFeedbacks(prev => prev.filter(f => f.id !== id));
      // Adjust page number if the current page becomes empty
      const newFiltered = filter === "all" ? feedbacks.filter(f => f.id !== id) : feedbacks.filter(f => f.id !== id && (filter === "resolved" ? f.is_resolved : filter === "pending" ? !f.is_resolved : f.feedback_type === filter));
      const newTotalPages = Math.ceil(newFiltered.length / PER_PAGE);
      if (page > newTotalPages && newTotalPages > 0) setPage(newTotalPages);
      if (newTotalPages === 0) setPage(1);
      alert("✅ Feedback deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Delete failed — please check the backend route or verify adminAPI.deleteReview URL");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = filter === "all"      ? feedbacks
    : filter === "resolved"              ? feedbacks.filter(f => f.is_resolved)
    : filter === "pending"               ? feedbacks.filter(f => !f.is_resolved)
    : feedbacks.filter(f => f.feedback_type === filter);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const counts = {
    all:      feedbacks.length,
    pending:  feedbacks.filter(f => !f.is_resolved).length,
    resolved: feedbacks.filter(f =>  f.is_resolved).length,
  };

  const handleFilter = (f) => { setFilter(f); setPage(1); };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: "#e6edf3", fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
          📬 User Feedback
        </h1>
        <p style={{ color: "#8b949e", fontSize: 14 }}>
          Resolve — user will automatically receive an email
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total",    value: counts.all,      color: "#4CAF50" },
          { label: "Pending",  value: counts.pending,  color: "#ff9800" },
          { label: "Resolved", value: counts.resolved, color: "#2196F3" },
        ].map(s => (
          <div key={s.label} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "#8b949e", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["all","pending","resolved","bug","feature","feedback","complaint"].map(f => (
          <button key={f} onClick={() => handleFilter(f)} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer",
            border: "1px solid",
            background:  filter === f ? "#4CAF50"     : "transparent",
            color:       filter === f ? "#fff"         : "#8b949e",
            borderColor: filter === f ? "#4CAF50"      : "#30363d",
          }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ color: "#8b949e", textAlign: "center", padding: 40 }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: 40, textAlign: "center", color: "#8b949e" }}>
          No feedback found
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {paginated.map(fb => {
              const t = TYPE_COLORS[fb.feedback_type] || TYPE_COLORS.feedback;
              return (
                <div key={fb.id} style={{
                  background: "#161b22", border: `1px solid ${successId === fb.id ? "rgba(76,175,80,0.5)" : "#30363d"}`,
                  borderRadius: 12, padding: 20,
                  opacity: fb.is_resolved ? 0.7 : 1,
                  transition: "border 0.3s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: "50%",
                        background: "rgba(76,175,80,0.2)", color: "#4CAF50",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 15, flexShrink: 0,
                      }}>
                        {fb.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ color: "#e6edf3", fontWeight: 600, fontSize: 14 }}>{fb.name}</div>
                        <div style={{ color: "#8b949e", fontSize: 12 }}>{fb.email}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ background: t.bg, color: t.color, padding: "4px 10px", borderRadius: 20, fontSize: 12 }}>
                        {t.label}
                      </span>
                      <span style={{
                        background: fb.is_resolved ? "rgba(33,150,243,0.1)" : "rgba(255,152,0,0.1)",
                        color:      fb.is_resolved ? "#2196F3"               : "#ff9800",
                        padding: "4px 10px", borderRadius: 20, fontSize: 12,
                      }}>
                        {fb.is_resolved ? "✅ Resolved" : "⏳ Pending"}
                      </span>
                    </div>
                  </div>

                  <p style={{ color: "#c9d1d9", fontSize: 14, lineHeight: 1.6, background: "#0d1117", padding: "12px 16px", borderRadius: 8, margin: "0 0 12px" }}>
                    {fb.message}
                  </p>

                  {successId === fb.id && (
                    <div style={{ background: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.3)", borderRadius: 8, padding: "8px 14px", marginBottom: 10, fontSize: 13, color: "#4CAF50" }}>
                      ✅ Resolved — email sent as well!
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <span style={{ color: "#8b949e", fontSize: 12 }}>
                      🕐 {new Date(fb.created_at).toLocaleDateString("en-PK")}
                    </span>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        onClick={() => handleDelete(fb.id)}
                        disabled={deletingId === fb.id}
                        style={{
                          padding: "7px 16px",
                          background: "rgba(220,53,69,0.15)",
                          color: "#ff6b6b",
                          border: "1px solid rgba(220,53,69,0.3)",
                          borderRadius: 8, fontSize: 13, cursor: "pointer",
                          opacity: deletingId === fb.id ? 0.6 : 1,
                        }}
                      >
                        {deletingId === fb.id ? "Deleting..." : "🗑️ Delete"}
                      </button>

                      {!fb.is_resolved && (
                        <button
                          onClick={() => resolve(fb.id)}
                          disabled={resolvingId === fb.id}
                          style={{
                            padding: "7px 16px",
                            background: "rgba(76,175,80,0.15)",
                            color: "#4CAF50",
                            border: "1px solid rgba(76,175,80,0.3)",
                            borderRadius: 8, fontSize: 13, cursor: "pointer",
                            opacity: resolvingId === fb.id ? 0.6 : 1,
                          }}
                        >
                          {resolvingId === fb.id ? "Sending..." : "✅ Mark as Resolved"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, padding: "16px 20px", background: "#161b22", border: "1px solid #30363d", borderRadius: 14 }}>
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                style={{ padding: "10px 20px", background: "rgba(76,175,80,0.1)", color: "#4CAF50", border: "1px solid rgba(76,175,80,0.3)", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, opacity: page === 1 ? 0.4 : 1 }}
              >
                ← Previous
              </button>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#e6edf3", fontSize: 14, fontWeight: 700 }}>Page {page} / {totalPages}</div>
                <div style={{ color: "#8b949e", fontSize: 12 }}>{filtered.length} total</div>
              </div>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages}
                style={{ padding: "10px 20px", background: "rgba(76,175,80,0.1)", color: "#4CAF50", border: "1px solid rgba(76,175,80,0.3)", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, opacity: page === totalPages ? 0.4 : 1 }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}