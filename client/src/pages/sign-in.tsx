import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hwm_user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user.creatorId) {
          setLocation(`/creator/${user.creatorId}`);
        } else {
          setLocation("/");
        }
      }
    } catch {}
  }, [setLocation]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) return setError("Email is required.");
    if (!password.trim()) return setError("Password is required.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Sign in failed");
      localStorage.setItem("hwm_user", JSON.stringify(data.user));
      if (data.user.creatorId) {
        setLocation(`/creator/${data.user.creatorId}`);
      } else {
        setLocation("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(108,240,255,.15)",
    borderRadius: 6,
    color: "#eaf0ff",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box" as const,
  };

  return (
    <div className="hwm-app">
      <div className="bg-lines" />
      <div className="wrap" style={{ paddingTop: 30, maxWidth: 420, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span></span>
          <a href="/sign-up" style={{ color: "#a06bff", textDecoration: "none", fontSize: 14, fontWeight: 600 }} data-testid="link-top-signup">New creator? Sign Up &rarr;</a>
        </div>
        <section className="panel" style={{ padding: 32 }}>
          <h2 style={{ color: "#6cf0ff", fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: "center" }} data-testid="text-signin-title">Creators Login</h2>
          <p style={{ color: "rgba(170,182,232,.6)", fontSize: 14, textAlign: "center", marginBottom: 24 }} data-testid="text-signin-subtitle">Sign in to your Hit Wave Media account</p>

          {error && (
            <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(255,79,216,.12)", border: "1px solid rgba(255,79,216,.3)", borderRadius: 6, color: "#ff4fd8", fontSize: 14 }} data-testid="text-signin-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} data-testid="form-signin">
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#aab6e8", fontSize: 13, marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} data-testid="input-email" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", color: "#aab6e8", fontSize: 13, marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ ...inputStyle, paddingRight: 50 }}
                  data-testid="input-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6cf0ff", fontSize: 12, cursor: "pointer", padding: "4px 6px" }} data-testid="button-toggle-password">
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 0",
                background: loading ? "rgba(108,240,255,.3)" : "linear-gradient(135deg, #6cf0ff 0%, #a06bff 100%)",
                border: "none",
                borderRadius: 6,
                color: "#050615",
                fontWeight: 700,
                fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              data-testid="button-signin-submit"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          <p style={{ color: "rgba(170,182,232,.5)", fontSize: 13, textAlign: "center", marginTop: 20 }}>
            Don't have an account? <a href="/sign-up" style={{ color: "#6cf0ff", textDecoration: "none" }} data-testid="link-signup">Sign Up</a>
          </p>
        </section>
      </div>
    </div>
  );
}
