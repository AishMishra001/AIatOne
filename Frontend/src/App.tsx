import React, { useState, useEffect } from "react";
import { Auth } from "./components/Auth";
import { LogOut, CheckCircle2, User, KeyRound, Calendar } from "lucide-react";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem("userEmail"));

  const handleAuthSuccess = (newToken: string, email: string) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("userEmail", email);
    setToken(newToken);
    setUserEmail(email);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setToken(null);
    setUserEmail(null);
  };

  if (!token) {
    return (
      <div style={{ padding: "20px" }}>
        <Auth onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  return (
    <div className="glass-card animate-fade-in" style={{ width: "100%", maxWidth: "600px", padding: "40px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "#34d399", padding: "8px", borderRadius: "10px" }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Secure Session</h1>
            <span style={{ fontSize: "0.8rem", color: "#34d399", fontWeight: 500 }}>Authenticated via JWT</span>
          </div>
        </div>

        <button onClick={handleLogout} style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(239, 68, 68, 0.08)",
          border: "1px solid rgba(239, 68, 68, 0.15)",
          color: "#f87171",
          padding: "8px 16px",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: 600,
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)"}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0, color: "#9ca3af" }}>User Identity & Details</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)" }}>
            <User size={20} style={{ color: "#818cf8" }} />
            <div>
              <div style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 700 }}>Email Address</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 500, color: "#f3f4f6" }}>{userEmail}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)" }}>
            <KeyRound size={20} style={{ color: "#a855f7" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 700 }}>Access Token (JWT)</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 500, color: "#a855f7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {token}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)" }}>
            <Calendar size={20} style={{ color: "#38bdf8" }} />
            <div>
              <div style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 700 }}>Active Since</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 500, color: "#f3f4f6" }}>
                {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05))", border: "1px solid rgba(99, 102, 241, 0.1)", borderRadius: "16px", padding: "20px", marginTop: "12px", textAlign: "center" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "0.9rem", color: "#e5e7eb", fontWeight: 500 }}>
            🎉 You have successfully completed the authentication flow!
          </p>
          <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
            The frontend is calling your local Bun + Elysia backend.
          </span>
        </div>
      </div>
    </div>
  );
}
