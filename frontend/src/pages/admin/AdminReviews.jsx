import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");

  const token   = localStorage.getItem("kisan_token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/feedback/admin/all`, { headers });
      setReviews(res.data);
    } catch {
      console.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id) => {
    if (!confirm("Are you sure? The review will be permanently deleted!")) return;
    try {
      await axios.delete(`${API}/api/feedback/admin/${id}`, { headers });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Delete failed, please try again");
    }
  };

  const filtered =
    filter === "all"      ? reviews :
    filter === "5star"    ? reviews.filter((r) => r.rating === 5) :
    filter === "low"      ? reviews.filter((r) => r.rating <= 2) :
    reviews;

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ color: "#e6edf3", fontSize: "24px", fontWeight: "700", marginBottom: "6px" }}>
          ⭐ User Reviews
        </h1>
        <p style={{ color: "#8b949e", fontSize: "14px" }}>
          Manage reviews — delete inappropriate ones
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Reviews", value: reviews.length,       color: "#4CAF50" },
          { label: "Avg Rating",    value: `${avg} ★`,           color: "#ffc107" },
          { label: "5 Star",        value: reviews.filter(r => r.rating === 5).length, color: "#2196F3" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "#161b22", border: "1px solid #30363d",
            borderRadius: "12px", padding: "20px", textAlign: "center",
          }}>
            <div style={{ fontSize: "26px", fontWeight: "700", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "13px", color: "#8b949e", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {[
          { key: "all",   label: "All" },
          { key: "5star", label: "5 ★ Only" },
          { key: "low",   label: "Low Rating" },
        ].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: "6px 16px", borderRadius: "20px", fontSize: "13px",
            cursor: "pointer", border: "1px solid",
            background:  filter === f.key ? "#4CAF50"     : "transparent",
            color:       filter === f.key ? "#fff"         : "#8b949e",
            borderColor: filter === f.key ? "#4CAF50"     : "#30363d",
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div style={{ color: "#8b949e", textAlign: "center", padding: "40px" }}>
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: "#161b22", border: "1px solid #30363d",
          borderRadius: "12px", padding: "40px", textAlign: "center",
          color: "#8b949e", fontSize: "14px",
        }}>
          No reviews found
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((r) => (
            <div key={r.id} style={{
              background: "#161b22", border: "1px solid #30363d",
              borderRadius: "12px", padding: "20px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                {/* User info */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "50%",
                    background: "rgba(76,175,80,0.2)", color: "#4CAF50",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: "700", fontSize: "15px", flexShrink: 0,
                  }}>
                    {r.user_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: "#e6edf3", fontWeight: "600", fontSize: "14px" }}>
                      {r.user_name}
                    </div>
                    <div style={{ color: "#8b949e", fontSize: "12px" }}>
                      {r.city} · {r.crop}
                    </div>
                  </div>
                </div>

                {/* Rating + Delete */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ color: "#ffc107", fontSize: "16px", letterSpacing: "2px" }}>
                    {stars(r.rating)}
                  </span>
                  <button onClick={() => deleteReview(r.id)} style={{
                    padding: "6px 14px",
                    background: "rgba(220,53,69,0.1)",
                    color: "#ff6b6b",
                    border: "1px solid rgba(220,53,69,0.2)",
                    borderRadius: "8px", fontSize: "13px", cursor: "pointer",
                  }}>
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {/* Review text */}
              <p style={{
                color: "#c9d1d9", fontSize: "14px", lineHeight: "1.6",
                background: "#0d1117", padding: "12px 16px",
                borderRadius: "8px", margin: "0 0 10px",
              }}>
                "{r.review}"
              </p>

              <div style={{ color: "#8b949e", fontSize: "12px" }}>
                🕐 {new Date(r.created_at).toLocaleDateString("en-PK")}
                {r.user_email && (
                  <span style={{ marginLeft: "12px" }}>📧 {r.user_email}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}