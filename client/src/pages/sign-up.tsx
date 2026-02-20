import { useState } from "react";
import { useLocation } from "wouter";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Creator name is required.");
    if (!email.trim()) return setError("Email is required.");
    if (email !== verifyEmail) return setError("Emails do not match.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Sign up failed");
      localStorage.setItem("hwm_user", JSON.stringify(data.user));
      setLocation(`/creator/${data.user.creatorId}`);
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
      <div className="wrap" style={{ paddingTop: 60, maxWidth: 420, margin: "0 auto" }}>
        <section className="panel" style={{ padding: 32 }}>
          <h2 style={{ color: "#6cf0ff", fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: "center" }} data-testid="text-signup-title">Create Account</h2>
          <p style={{ color: "rgba(170,182,232,.6)", fontSize: 14, textAlign: "center", marginBottom: 24 }} data-testid="text-signup-subtitle">Join Hit Wave Media as a creator</p>

          {error && (
            <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(255,79,216,.12)", border: "1px solid rgba(255,79,216,.3)", borderRadius: 6, color: "#ff4fd8", fontSize: 14 }} data-testid="text-signup-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} data-testid="form-signup">
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#aab6e8", fontSize: 13, marginBottom: 6 }}>Creator Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your artist or creator name" style={inputStyle} data-testid="input-name" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#aab6e8", fontSize: 13, marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} data-testid="input-email" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#aab6e8", fontSize: 13, marginBottom: 6 }}>Verify Email</label>
              <input type="email" value={verifyEmail} onChange={(e) => setVerifyEmail(e.target.value)} placeholder="Re-enter your email" style={inputStyle} data-testid="input-verify-email" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#aab6e8", fontSize: 13, marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (min 6 chars)"
                  style={{ ...inputStyle, paddingRight: 50 }}
                  data-testid="input-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6cf0ff", fontSize: 12, cursor: "pointer", padding: "4px 6px" }} data-testid="button-toggle-password">
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", color: "#aab6e8", fontSize: 13, marginBottom: 6 }}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  style={{ ...inputStyle, paddingRight: 50 }}
                  data-testid="input-confirm-password"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6cf0ff", fontSize: 12, cursor: "pointer", padding: "4px 6px" }} data-testid="button-toggle-confirm-password">
                  {showConfirmPassword ? "HIDE" : "SHOW"}
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
              data-testid="button-signup-submit"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
          <p style={{ color: "rgba(170,182,232,.5)", fontSize: 13, textAlign: "center", marginTop: 20 }}>
            Already have an account? <a href="/sign-in" style={{ color: "#6cf0ff", textDecoration: "none" }} data-testid="link-signin">Sign In</a>
          </p>
        </section>
        <div style={{ paddingTop: 20, textAlign: "center" }}>
          <a href="/" style={{ color: "#6cf0ff", textDecoration: "none" }} data-testid="link-back-home">&#8592; Back to Home</a>
        </div>
      </div>
    </div>
  );
}
