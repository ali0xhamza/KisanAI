// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    const stored = localStorage.getItem("kisan_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken]     = useState(() => localStorage.getItem("kisan_token") || null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (token && !user) {
      authAPI.getProfile()
        .then((profile) => {
          setUser(profile);
          localStorage.setItem("kisan_user", JSON.stringify(profile));
        })
        .catch(() => logout());
    }
  }, [token, user]);

  // ── Register ──────────────────────────────────────────────────────
  async function register(name, email, password, phone = "", city = "") {
    setLoading(true);
    setError(null);
    try {
      const data = await authAPI.register({ name, email, password, phone, city });
      if (data.step === "verify") {
        return { success: true, requires_otp: true, email };
      }
      _saveSession(data);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || "Registration failed";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  // ── Verify OTP ────────────────────────────────────────────────────
  async function verifyOtp(email, otp) {
    setLoading(true);
    setError(null);
    try {
      const data = await authAPI.verifyOtp({ email, otp });
      _saveSession(data);
      return { success: true, role: data.user.role };
    } catch (err) {
      const msg = err.response?.data?.detail || "Invalid OTP";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  // ── Resend OTP ────────────────────────────────────────────────────
  async function resendOtp(email) {
    try {
      await authAPI.resendOtp({ email });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to resend OTP";
      return { success: false, error: msg };
    }
  }

  // ── Google Login ──────────────────────────────────────────────────
  async function loginWithGoogle(credential) {
    setLoading(true);
    setError(null);
    try {
      const data = await authAPI.googleLogin({ credential });
      _saveSession(data);
      return { success: true, role: data.user.role };
    } catch (err) {
      const msg = err.response?.data?.detail || "Google login failed";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  // ── Login ─────────────────────────────────────────────────────────
  async function login(email, password) {
    setLoading(true);
    setError(null);
    try {
      const data = await authAPI.login(email, password);
      _saveSession(data);
      return { success: true, role: data.user.role };
    } catch (err) {
      if (err.response?.status === 403) {
        return { success: false, requires_otp: true, email };
      }
      const msg = err.response?.data?.detail || "Login failed";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  // ── Logout ────────────────────────────────────────────────────────
  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("kisan_token");
    localStorage.removeItem("kisan_user");
  }

  // ── Update Profile ────────────────────────────────────────────────
  async function updateProfile(data) {
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(data);
      const updated = { ...user, ...res.user };
      setUser(updated);
      localStorage.setItem("kisan_user", JSON.stringify(updated));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || "Update failed";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  function _saveSession(data) {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("kisan_token", data.token);
    localStorage.setItem("kisan_user", JSON.stringify(data.user));
  }

  const isLoggedIn = !!token && !!user;
  const isAdmin    = user?.role === "admin";

  return (
    <AuthContext.Provider value={{
      user, token, loading, error,
      isLoggedIn, isAdmin,
      login, register, logout, updateProfile,
      verifyOtp, resendOtp, loginWithGoogle,
      setError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export default AuthContext;