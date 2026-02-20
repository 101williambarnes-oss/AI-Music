import { useState } from "react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="hwm-app">
      <div className="bg-lines" />
      <div className="wrap" style={{ paddingTop: 60, maxWidth: 420, margin: "0 auto" }}>
        <section className="panel" style={{ padding: 32 }}>
          <h2 style={{ color: "#6cf0ff", fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: "center" }} data-testid="text-signin-title">Creators Login</h2>
          <p style={{ color: "rgba(170,182,232,.6)", fontSize: 14, textAlign: "center", marginBottom: 24 }} data-testid="text-signin-subtitle">Sign in to your Hit Wave Media account</p>
          <form onSubmit={(e) => e.preventDefault()} data-testid="form-signin">
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#aab6e8", fontSize: 13, marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,.06)",
                  border: "1px solid rgba(108,240,255,.15)",
                  borderRadius: 6,
                  color: "#eaf0ff",
                  fontSize: 15,
                  outline: "none",
                  boxSizing: "border-box",
                }}
                data-testid="input-email"
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", color: "#aab6e8", fontSize: 13, marginBottom: 6 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,.06)",
                  border: "1px solid rgba(108,240,255,.15)",
                  borderRadius: 6,
                  color: "#eaf0ff",
                  fontSize: 15,
                  outline: "none",
                  boxSizing: "border-box",
                }}
                data-testid="input-password"
              />
            </div>
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px 0",
                background: "linear-gradient(135deg, #6cf0ff 0%, #a06bff 100%)",
                border: "none",
                borderRadius: 6,
                color: "#050615",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
              }}
              data-testid="button-signin-submit"
            >
              Sign In
            </button>
          </form>
          <p style={{ color: "rgba(170,182,232,.5)", fontSize: 13, textAlign: "center", marginTop: 20 }}>
            Don't have an account? <a href="/sign-up" style={{ color: "#6cf0ff", textDecoration: "none" }} data-testid="link-signup">Sign Up</a>
          </p>
        </section>
        <div style={{ paddingTop: 20, textAlign: "center" }}>
          <a href="/" style={{ color: "#6cf0ff", textDecoration: "none" }} data-testid="link-back-home">&#8592; Back to Home</a>
        </div>
      </div>
    </div>
  );
}
