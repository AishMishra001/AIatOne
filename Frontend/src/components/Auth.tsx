import React, { useState } from "react";
import { Mail, Lock, ShieldCheck, ArrowRight, UserPlus, CheckCircle2 } from "lucide-react";

interface AuthProps {
  onAuthSuccess: (token: string, email: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/signin" : "/api/auth/signup";

    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }

      if (data.token) {
        setMessage(isLogin ? "Welcome back!" : "Account created successfully!");
        setTimeout(() => {
          onAuthSuccess(data.token, data.user.email);
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || "Failed to communicate with server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ width: "100%", maxWidth: "420px", padding: "40px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{
          display: "inline-flex",
          padding: "12px",
          background: "rgba(99, 102, 241, 0.1)",
          borderRadius: "16px",
          color: "#818cf8",
          marginBottom: "16px"
        }}>
          <ShieldCheck size={32} />
        </div>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0 0 8px 0", letterSpacing: "-0.025em" }}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p style={{ color: "#9ca3af", fontSize: "0.9rem", margin: 0 }}>
          {isLogin ? "Please sign in to access your dashboard" : "Sign up to start secure operations"}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "#f87171",
            padding: "12px",
            borderRadius: "12px",
            fontSize: "0.85rem",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            color: "#34d399",
            padding: "12px",
            borderRadius: "12px",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}>
            <CheckCircle2 size={16} />
            {message}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 500, color: "#d1d5db" }}>Email Address</label>
          <div style={{ position: "relative" }}>
            <Mail size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
            <input
              type="email"
              required
              className="glass-input"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", paddingLeft: "48px" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 500, color: "#d1d5db" }}>Password</label>
          <div style={{ position: "relative" }}>
            <Lock size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
            <input
              type="password"
              required
              minLength={isLogin ? undefined : 6}
              className="glass-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", paddingLeft: "48px" }}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="primary-btn" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginTop: "8px"
        }}>
          {loading ? (
            <span>Processing...</span>
          ) : (
            <>
              <span>{isLogin ? "Sign In" : "Register Now"}</span>
              {isLogin ? <ArrowRight size={18} /> : <UserPlus size={18} />}
            </>
          )}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "24px", fontSize: "0.875rem" }}>
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
            setMessage(null);
          }}
          style={{
            background: "none",
            border: "none",
            color: "#818cf8",
            cursor: "pointer",
            fontWeight: 500,
            textDecoration: "underline"
          }}
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </button>
      </div>
    </div>
  );
};
