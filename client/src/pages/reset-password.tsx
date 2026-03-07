import { useState } from "react";
import { PageNav } from "@/components/page-nav";

export default function ResetPassword() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) return setError("Invalid reset link.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to reset password.");
      } else {
        setMessage(data.message);
      }
    } catch {
      setError("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid rgba(108,240,255,.15)",
    background: "rgba(255,255,255,.04)",
    color: "#eaf0ff",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  if (!token) {
    return (
      <div className="hwm-app">
        <div className="bg-lines" />
        <div className="wrap" style={{ paddingTop: 16, maxWidth: 440, margin: "0 auto" }}>
          <PageNav />
          <section className="panel" style={{ padding: "32px 24px", textAlign: "center" }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#ff4fd8", marginBottom: 12 }} data-testid="text-reset-invalid">Invalid Reset Link</h2>
            <p style={{ fontSize: 13, color: "rgba(170,182,232,.6)", marginBottom: 20 }}>This reset link is invalid or has expired.</p>
            <a href="/forgot-password" style={{ display: "inline-block", padding: "10px 24px", background: "linear-gradient(90deg, #2b7cff, #38e0ff)", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }} data-testid="link-request-new-reset">Request New Reset Link</a>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="hwm-app">
      <div className="bg-lines" />
      <div className="wrap" style={{ paddingTop: 16, maxWidth: 440, margin: "0 auto" }}>
        <PageNav />
        <section className="panel" style={{ padding: "32px 24px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#eaf0ff", marginBottom: 8, textAlign: "center" }} data-testid="text-reset-title">Reset Password</h2>
          <p style={{ fontSize: 13, color: "rgba(170,182,232,.6)", marginBottom: 24, textAlign: "center" }}>Enter your new password below.</p>

          {message && (
            <div style={{ padding: "12px 16px", borderRadius: 8, background: "rgba(108,240,255,.08)", border: "1px solid rgba(108,240,255,.2)", color: "#6cf0ff", fontSize: 13, marginBottom: 16, textAlign: "center" }} data-testid="text-reset-success">
              {message}
              <div style={{ marginTop: 12 }}>
                <a href="/sign-in" style={{ display: "inline-block", padding: "8px 20px", background: "linear-gradient(90deg, #2b7cff, #38e0ff)", borderRadius: 6, color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }} data-testid="link-signin-after-reset">Sign In Now</a>
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: "12px 16px", borderRadius: 8, background: "rgba(255,79,216,.08)", border: "1px solid rgba(255,79,216,.2)", color: "#ff4fd8", fontSize: 13, marginBottom: 16, textAlign: "center" }} data-testid="text-reset-error">
              {error}
            </div>
          )}

          {!message && (
            <form onSubmit={handleSubmit} data-testid="form-reset-password">
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", color: "#aab6e8", fontSize: 13, marginBottom: 6 }}>New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  style={inputStyle}
                  required
                  data-testid="input-new-password"
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", color: "#aab6e8", fontSize: 13, marginBottom: 6 }}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  style={inputStyle}
                  required
                  data-testid="input-confirm-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 8,
                  border: "none",
                  background: loading ? "rgba(108,240,255,.3)" : "linear-gradient(90deg, #2b7cff, #38e0ff)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                data-testid="button-reset-password"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
