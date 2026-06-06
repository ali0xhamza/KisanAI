// frontend/src/pages/Community.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CATEGORIES = [
  { key: "all",        label: "📋 All",       color: "#6b7280" },
  { key: "fasal",      label: "🌾 Crop",      color: "#16a34a" },
  { key: "mosum",      label: "🌤️ Weather",   color: "#2563eb" },
  { key: "mandi",      label: "💰 Market",    color: "#d97706" },
  { key: "keera_maar", label: "🐛 Pest Control", color: "#dc2626" },
  { key: "general",    label: "💬 General",   color: "#7c3aed" },
];

const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.key, c]));

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── New Post Modal ────────────────────────────────────────────────
function NewPostModal({ onClose, onCreated, token }) {
  const [form, setForm]       = useState({ title: "", content: "", category: "fasal" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const submit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError("Please fill both title and problem");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/api/community/posts`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onCreated();
      onClose();
    } catch {
      setError("Could not create post, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>✍️ New Question</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <select
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          style={styles.select}
        >
          {CATEGORIES.filter(c => c.key !== "all").map(c => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>

        <input
          placeholder="Question title (e.g., Why are wheat leaves turning yellow?)"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          style={styles.input}
          maxLength={200}
        />

        <textarea
          placeholder="Describe your problem in detail — crop, area, symptoms..."
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          style={{ ...styles.input, minHeight: 120, resize: "vertical" }}
          maxLength={2000}
        />

        {error && <p style={styles.errorText}>{error}</p>}

        <div style={styles.modalFooter}>
          <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
          <button onClick={submit} disabled={loading} style={styles.submitBtn}>
            {loading ? "⏳ Posting..." : "📤 Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Post Detail Modal ─────────────────────────────────────────────
function PostDetail({ post, onClose, onLike, token }) {
  const [comments, setComments]     = useState([]);
  const [newComment, setNewComment] = useState("");
  const [aiLoading, setAiLoading]   = useState(false);
  const [commLoading, setCommLoading] = useState(false);
  const [detail, setDetail]         = useState(post);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(`${API}/api/community/posts/${post.id}`, { headers })
      .then(r => {
        setDetail(r.data);
        setComments(r.data.comments || []);
      })
      .catch(() => {});
  }, [post.id]);

  const addComment = async () => {
    if (!newComment.trim()) return;
    setCommLoading(true);
    try {
      const r = await axios.post(
        `${API}/api/community/posts/${post.id}/comments`,
        { content: newComment },
        { headers }
      );
      setComments(c => [...c, r.data]);
      setNewComment("");
    } catch {
      alert("Could not add comment");
    } finally {
      setCommLoading(false);
    }
  };

  const getAiMashwara = async () => {
    setAiLoading(true);
    try {
      const r = await axios.post(
        `${API}/api/community/posts/${post.id}/ai-mashwara`,
        {},
        { headers }
      );
      setComments(c => [...c, r.data]);
    } catch {
      alert("Could not get AI advice, please try again");
    } finally {
      setAiLoading(false);
    }
  };

  const cat = CAT_MAP[detail.category] || CAT_MAP.general;

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...styles.modal, maxWidth: 640, maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
        <div style={styles.modalHeader}>
          <span style={{ ...styles.catBadge, background: cat.color + "22", color: cat.color }}>
            {cat.label}
          </span>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "0 4px" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "12px 0 6px", color: "#1a1a1a" }}>
            {detail.title}
          </h2>
          <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
            {detail.content}
          </p>
          <div style={styles.metaRow}>
            <span>👤 {detail.author_name}</span>
            {detail.author_city && <span>📍 {detail.author_city}</span>}
            <span>{timeAgo(detail.created_at)}</span>
          </div>

          <button
            onClick={() => onLike(detail.id)}
            style={{
              ...styles.likeBtn,
              background: detail.user_liked ? "#dcfce7" : "#f3f4f6",
              color:      detail.user_liked ? "#16a34a" : "#6b7280",
            }}
          >
            {detail.user_liked ? "✅" : "👍"} {detail.likes} Like
          </button>

          <button onClick={getAiMashwara} disabled={aiLoading} style={styles.aiBtn}>
            {aiLoading ? "⏳ AI is thinking..." : "🤖 Get AI Advice"}
          </button>

          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "20px 0 10px" }}>
            💬 Replies ({comments.length})
          </h3>

          {comments.length === 0 && (
            <p style={{ color: "#999", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
              No answers yet — be the first to answer!
            </p>
          )}

          {comments.map(c => (
            <div key={c.id} style={{
              ...styles.commentCard,
              background:  c.is_ai_response ? "#f0fdf4" : "#f9fafb",
              borderLeft: `3px solid ${c.is_ai_response ? "#16a34a" : "#e5e7eb"}`,
            }}>
              <div style={styles.commentMeta}>
                <span style={{ fontWeight: 600, fontSize: 13, color: c.is_ai_response ? "#16a34a" : "#374151" }}>
                  {c.author_name}
                </span>
                <span style={{ color: "#9ca3af", fontSize: 12 }}>{timeAgo(c.created_at)}</span>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {c.content}
              </p>
            </div>
          ))}
        </div>

        <div style={styles.commentInput}>
          <textarea
            placeholder="Write your answer or experience..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            style={{ ...styles.input, minHeight: 70, margin: 0, resize: "none" }}
          />
          <button
            onClick={addComment}
            disabled={commLoading || !newComment.trim()}
            style={{ ...styles.submitBtn, marginTop: 8 }}
          >
            {commLoading ? "⏳..." : "📤 Reply"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Community Page ───────────────────────────────────────────
export default function Community() {
  const { token } = useAuth();
  const [posts, setPosts]       = useState([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading]   = useState(false);
  const [showNew, setShowNew]   = useState(false);
  const [selected, setSelected] = useState(null);
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchPosts = useCallback(async (cat = category, pg = page) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 10 };
      if (cat !== "all") params.category = cat;
      const r = await axios.get(`${API}/api/community/posts`, { headers, params });
      setPosts(r.data.posts);
      setTotal(r.data.total);
    } catch {
      alert("Could not load posts");
    } finally {
      setLoading(false);
    }
  }, [category, page, token]);

  useEffect(() => { fetchPosts(category, page); }, [category, page]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
    fetchPosts(cat, 1);
  };

  const handleLike = async (postId) => {
    try {
      const r = await axios.post(`${API}/api/community/posts/${postId}/like`, {}, { headers });
      setPosts(ps => ps.map(p =>
        p.id === postId ? { ...p, likes: r.data.likes, user_liked: r.data.liked } : p
      ));
      if (selected?.id === postId) {
        setSelected(s => ({ ...s, likes: r.data.likes, user_liked: r.data.liked }));
      }
    } catch {}
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🌾 Farmer Community</h1>
          <p style={styles.subtitle}>Share advice with each other — farm together</p>
        </div>
        <button onClick={() => setShowNew(true)} style={styles.newBtn}>
          ✍️ Ask Question
        </button>
      </div>

      <div style={styles.tabs}>
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => handleCategoryChange(c.key)}
            style={{
              ...styles.tab,
              background: category === c.key ? c.color : "transparent",
              color:      category === c.key ? "#fff"  : c.color,
              border:     `2px solid ${c.color}`,
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.centered}>⏳ Loading...</div>
      ) : posts.length === 0 ? (
        <div style={styles.centered}>
          <p style={{ fontSize: 48 }}>🌾</p>
          <p style={{ color: "#6b7280" }}>No questions in this category yet</p>
          <button onClick={() => setShowNew(true)} style={{ ...styles.newBtn, marginTop: 16 }}>
            Ask the First Question
          </button>
        </div>
      ) : (
        <div style={styles.postList}>
          {posts.map(post => {
            const cat = CAT_MAP[post.category] || CAT_MAP.general;
            return (
              <div key={post.id} style={styles.postCard} onClick={() => setSelected(post)}>
                <div style={styles.postTop}>
                  <span style={{ ...styles.catBadge, background: cat.color + "18", color: cat.color }}>
                    {cat.label}
                  </span>
                  <span style={styles.timeText}>{timeAgo(post.created_at)}</span>
                </div>
                <h3 style={styles.postTitle}>{post.title}</h3>
                <p style={styles.postExcerpt}>
                  {post.content.length > 120 ? post.content.slice(0, 120) + "..." : post.content}
                </p>
                <div style={styles.postFooter}>
                  <span style={styles.metaChip}>
                    👤 {post.author_name}{post.author_city ? `, ${post.author_city}` : ""}
                  </span>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      onClick={e => { e.stopPropagation(); handleLike(post.id); }}
                      style={{
                        ...styles.likeBtn,
                        background: post.user_liked ? "#dcfce7" : "#f3f4f6",
                        color:      post.user_liked ? "#16a34a" : "#6b7280",
                        padding: "4px 10px", fontSize: 13,
                      }}
                    >
                      {post.user_liked ? "✅" : "👍"} {post.likes}
                    </button>
                    <span style={styles.metaChip}>💬 {post.comment_count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={styles.pageBtn}>
            ◀️ Previous
          </button>
          <span style={{ fontSize: 14, color: "#374151" }}>{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={styles.pageBtn}>
            Next ▶️
          </button>
        </div>
      )}

      {showNew && (
        <NewPostModal
          token={token}
          onClose={() => setShowNew(false)}
          onCreated={() => fetchPosts(category, 1)}
        />
      )}
      {selected && (
        <PostDetail
          post={selected}
          token={token}
          onClose={() => setSelected(null)}
          onLike={handleLike}
        />
      )}
    </div>
  );
}

// ── Styles (unchanged) ────────────────────────────────────────────────────────
const styles = {
  page:        { maxWidth: 860, margin: "0 auto", padding: "24px 16px", fontFamily: "sans-serif" },
  header:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  title:       { fontSize: 28, fontWeight: 800, margin: 0, color: "#14532d" },
  subtitle:    { fontSize: 14, color: "#6b7280", margin: "4px 0 0" },
  newBtn:      { background: "#16a34a", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  tabs:        { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 },
  tab:         { padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .15s" },
  postList:    { display: "flex", flexDirection: "column", gap: 14 },
  postCard:    { background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "18px 20px", cursor: "pointer", transition: "box-shadow .15s", boxShadow: "0 1px 3px rgba(0,0,0,.06)" },
  postTop:     { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  catBadge:    { padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  timeText:    { fontSize: 12, color: "#9ca3af" },
  postTitle:   { fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 6px" },
  postExcerpt: { fontSize: 14, color: "#6b7280", margin: "0 0 12px", lineHeight: 1.5 },
  postFooter:  { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },
  metaChip:    { fontSize: 12, color: "#6b7280", background: "#f3f4f6", padding: "3px 8px", borderRadius: 8 },
  metaRow:     { display: "flex", gap: 12, fontSize: 12, color: "#9ca3af", marginBottom: 12, flexWrap: "wrap" },
  likeBtn:     { border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all .15s" },
  aiBtn:       { display: "block", width: "100%", margin: "8px 0", padding: "10px", background: "linear-gradient(90deg,#16a34a,#15803d)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" },
  overlay:     { position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 },
  modal:       { background: "#fff", borderRadius: 18, padding: 24, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.3)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle:  { fontSize: 20, fontWeight: 800, margin: 0, color: "#14532d" },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 },
  closeBtn:    { background: "#f3f4f6", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 16, fontWeight: 700 },
  input:       { display: "block", width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, marginBottom: 12, boxSizing: "border-box", outline: "none" },
  select:      { display: "block", width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, marginBottom: 12, boxSizing: "border-box" },
  cancelBtn:   { background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  submitBtn:   { background: "#16a34a", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  errorText:   { color: "#dc2626", fontSize: 13, marginBottom: 8 },
  commentCard: { borderRadius: 10, padding: "12px 14px", marginBottom: 10 },
  commentMeta: { display: "flex", justifyContent: "space-between", marginBottom: 6 },
  commentInput:{ borderTop: "1.5px solid #e5e7eb", paddingTop: 14, marginTop: 12 },
  centered:    { textAlign: "center", padding: "60px 20px", color: "#374151" },
  pagination:  { display: "flex", justifyContent: "center", alignItems: "center", gap: 20, marginTop: 28 },
  pageBtn:     { background: "#f3f4f6", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600 },
};