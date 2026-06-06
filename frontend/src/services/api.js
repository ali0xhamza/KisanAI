// src/services/api.js
import axios from "axios";

const BASE_URL = "http://localhost:8000";

// ── Axios instance ─────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — add token to every request ─────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("kisan_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — logout on 401 ─────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("kisan_token");
      localStorage.removeItem("kisan_user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

// ══════════════════════════════════════════════════════════════════
// AUTH APIs
// ══════════════════════════════════════════════════════════════════
export const authAPI = {
  register: async (data) => {
    const res = await api.post("/api/auth/register", data);
    return res.data;
  },
  login: async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get("/api/auth/me");
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put("/api/auth/me", data);
    return res.data;
  },
  forgotPassword: async (email) => {
    const res = await api.post("/api/auth/forgot-password", { email });
    return res.data;
  },
  resetPassword: async (token, password) => {
    const res = await api.post("/api/auth/reset-password", { token, password });
    return res.data;
  },
  verifyEmail: async (token) => {
    const res = await api.get(`/api/auth/verify-email/${token}`);
    return res.data;
  },
  verifyOtp:   (data) => api.post('/api/auth/verify-otp',  data).then(r => r.data),
  resendOtp:   (data) => api.post('/api/auth/resend-otp',  data).then(r => r.data),
  googleLogin: (data) => api.post('/api/auth/google',       data).then(r => r.data),
};

// ══════════════════════════════════════════════════════════════════
// MANDI APIs
// ══════════════════════════════════════════════════════════════════
export const mandiAPI = {
  getPrices: async (city = null, fasal = null) => {
    const params = {};
    if (city)  params.city  = city;
    if (fasal) params.fasal = fasal;
    const res = await api.get("/api/mandi/", { params });
    return res.data;
  },
  addPrice: async (data) => {
    const res = await api.post("/api/mandi/", data);
    return res.data;
  },
  updatePrice: async (id, data) => {
    const res = await api.put(`/api/mandi/${id}`, data);
    return res.data;
  },
  deletePrice: async (id) => {
    const res = await api.delete(`/api/mandi/${id}`);
    return res.data;
  },
};

// ══════════════════════════════════════════════════════════════════
// ADMIN APIs
// ══════════════════════════════════════════════════════════════════
export const adminAPI = {
  getUsers: async () => {
    const res = await api.get("/api/auth/admin/users");
    return res.data;
  },
  toggleUser: async (userId) => {
    const res = await api.patch(`/api/auth/admin/users/${userId}/toggle`);
    return res.data;
  },
  deleteUser: async (userId) => {
    const res = await api.delete(`/api/auth/admin/users/${userId}`);
    return res.data;
  },
  // ✅ FIXED: backend endpoints for feedback
  getAllReviews: () => api.get('/api/user-feedback/').then(r => r.data),
  deleteReview:  (id) => api.delete(`/api/user-feedback/admin/${id}`).then(r => r.data),
};

// ══════════════════════════════════════════════════════════════════
// AI APIs
// ══════════════════════════════════════════════════════════════════
export const aiAPI = {
  chat: async (messages, system = null) => {
    const res = await api.post("/api/ai/chat", { messages, system });
    return res.data.reply;
  },
  disease: async (messages) => {
    const res = await api.post("/api/ai/disease", { messages });
    return res.data.reply;
  },
  mandi: async (messages) => {
    const res = await api.post("/api/ai/mandi", { messages });
    return res.data.reply;
  },
};

// ══════════════════════════════════════════════════════════════════
// CHAT APIs
// ══════════════════════════════════════════════════════════════════
export const chatAPI = {
  save: async (message, response) => {
    const res = await api.post("/api/chat/save", { message, response });
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get("/api/chat/history");
    return res.data;
  },
};

export default api;