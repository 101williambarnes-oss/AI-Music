import { useState } from "react";
import { PageNav } from "@/components/page-nav";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email.trim()) return setError("Please enter your email address.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Something went wrong.");
      } else {
        setMessage(data.message);
        setEmail("");
      }
    } catch {
      setError("Failed to send reset request.");
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

  return (
    <div className="hwm-app">
      <div className="bg-lines" />
      <div className="wrap" style={{ paddingTop: 16, maxWidth: 440, margin: "0 auto" }}>
        <PageNav />
        <section className="panel" style={{ padding: "32px 24px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#eaf0ff", marginBottom: 8, textAlign: "center" }} data-testid="text-forgot-title">Forgot Password</h2>
          <p style={{ fontSize: 13, color: "rgba(170,182,232,.6)", marginBottom: 24, textAlign: "center" }}>Enter your email and we'll send you a link to reset your password.</p>

          {message && (
            <div style={{ padding: "12px 16px", borderRadius: 8, background: "rgba(108,240,255,.08)", border: "1px solid rgba(108,240,255,.2)", color: "#6cf0ff", fontSize: 13, marginBottom: 16, textAlign: "center" }} data-testid="text-forgot-success">
              {message}
            </div>
          )}

          {error && (
            <div style={{ padding: "12px 16px", borderRadius: 8, background: "rgba(255,79,216,.08)", border: "1px solid rgba(255,79,216,.2)", color: "#ff4fd8", fontSize: 13, marginBottom: 16, textAlign: "center" }} data-testid="text-forgot-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} data-testid="form-forgot-password">
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: "#aab6e8", fontSize: 13, marginBottom: 6 }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={inputStyle}
                required
                data-testid="input-forgot-email"
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
              data-testid="button-send-reset"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center" }}>
            <a href="/sign-in" style={{ color: "#6cf0ff", fontSize: 13, textDecoration: "none" }} data-testid="link-back-signin">Back to Sign In</a>
          </div>
        </section>
      </div>
    </div>
  );
}
