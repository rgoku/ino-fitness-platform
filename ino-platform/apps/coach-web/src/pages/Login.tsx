/**
 * Login & Signup — single screen with tab toggle.
 * Matches the Command Center dark theme.
 */
import { useState, FormEvent } from "react";
import { useAuth } from "../lib/auth";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { login, signup, loading, error } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      await login(email, password);
    } else {
      await signup(email, password, name);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#080A12", fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
    }}>
      <div style={{ width: 400, padding: 40 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: "0 auto 16px",
            background: "linear-gradient(135deg, #818CF8, #6366F1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: "-0.02em",
            boxShadow: "0 4px 24px rgba(99,102,241,0.35)",
          }}>
            INÖ
          </div>
          <div style={{ color: "#E8ECF4", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Coach Command Center
          </div>
          <div style={{ color: "#6B7A99", fontSize: 14, marginTop: 4 }}>
            {mode === "login" ? "Welcome back" : "Start your 14-day free trial"}
          </div>
        </div>

        {/* Mode Toggle */}
        <div style={{
          display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 12,
          padding: 4, marginBottom: 24, border: "1px solid rgba(255,255,255,0.06)",
        }}>
          {(["login", "signup"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: "10px 0", borderRadius: 9, border: "none",
              background: mode === m ? "rgba(129,140,248,0.12)" : "transparent",
              color: mode === m ? "#818CF8" : "#6B7A99",
              fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              transition: "all .15s",
            }}>
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B7A99", marginBottom: 6 }}>
                Full Name
              </label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Sarah Miller" required
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B7A99", marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="coach@example.com" required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B7A99", marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required minLength={8}
              style={inputStyle}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 10, marginBottom: 16,
              background: "rgba(251,113,133,0.1)", border: "1px solid rgba(251,113,133,0.2)",
              color: "#FB7185", fontSize: 13, fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
            background: loading ? "rgba(129,140,248,0.5)" : "linear-gradient(135deg, #818CF8, #6366F1)",
            color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit", letterSpacing: "-0.01em",
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            transition: "all .15s",
          }}>
            {loading ? "..." : mode === "login" ? "Log In" : "Start Free Trial"}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#475569" }}>
          {mode === "login" ? (
            <>Don't have an account? <span onClick={() => setMode("signup")} style={{ color: "#818CF8", cursor: "pointer", fontWeight: 600 }}>Start free trial</span></>
          ) : (
            <>Already have an account? <span onClick={() => setMode("login")} style={{ color: "#818CF8", cursor: "pointer", fontWeight: 600 }}>Log in</span></>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 10,
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
  color: "#E8ECF4", fontSize: 14, fontFamily: "inherit",
  outline: "none", transition: "border .15s",
  boxSizing: "border-box",
};
