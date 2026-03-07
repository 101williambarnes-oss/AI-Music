import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { PageNav } from "@/components/page-nav";

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
  const [agreeRights, setAgreeRights] = useState(false);
  const [agreeAI, setAgreeAI] = useState(false);
  const [agreeTOS, setAgreeTOS] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
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

    if (!name.trim()) return setError("Creator name is required.");
    if (!email.trim()) return setError("Email is required.");
    if (email.trim().toLowerCase() !== verifyEmail.trim().toLowerCase()) return setError("Emails do not match.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match. Make sure both password fields are exactly the same.");
    if (!agreeRights || !agreeAI || !agreeTOS) return setError("You must agree to all terms before creating an account.");

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
      <div className="wrap" style={{ paddingTop: 16, maxWidth: 420, margin: "0 auto" }}>
        <PageNav />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span></span>
          <a href="/sign-in" style={{ color: "#a06bff", textDecoration: "none", fontSize: 14, fontWeight: 600 }} data-testid="link-top-signin">Already a creator? Sign In &rarr;</a>
        </div>
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
              {confirmPassword.length > 0 && (
                <p style={{ fontSize: 12, marginTop: 6, color: password === confirmPassword ? "#4ade80" : "#ff4fd8" }} data-testid="text-password-match">
                  {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
                </p>
              )}
            </div>
            <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", color: "#aab6e8", fontSize: 13, lineHeight: 1.5 }} data-testid="label-agree-rights">
                <input type="checkbox" checked={agreeRights} onChange={(e) => setAgreeRights(e.target.checked)} style={{ marginTop: 3, accentColor: "#6cf0ff", flexShrink: 0 }} data-testid="checkbox-agree-rights" />
                I confirm that I own or have the rights to upload this content and that it does not violate any laws or copyrights.
              </label>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", color: "#aab6e8", fontSize: 13, lineHeight: 1.5 }} data-testid="label-agree-ai">
                <input type="checkbox" checked={agreeAI} onChange={(e) => setAgreeAI(e.target.checked)} style={{ marginTop: 3, accentColor: "#6cf0ff", flexShrink: 0 }} data-testid="checkbox-agree-ai" />
                I confirm this content was created using AI tools I am allowed to use.
              </label>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", color: "#aab6e8", fontSize: 13, lineHeight: 1.5 }} data-testid="label-agree-tos">
                <input type="checkbox" checked={agreeTOS} onChange={(e) => setAgreeTOS(e.target.checked)} style={{ marginTop: 3, accentColor: "#6cf0ff", flexShrink: 0 }} data-testid="checkbox-agree-tos" />
                <span>
                  I agree to Hit Wave Media's{" "}
                  <button type="button" onClick={() => setShowTerms(true)} style={{ background: "none", border: "none", color: "#6cf0ff", fontSize: 13, cursor: "pointer", padding: 0, textDecoration: "underline" }} data-testid="button-view-terms">Terms of Service</button>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreeRights || !agreeAI || !agreeTOS}
              style={{
                width: "100%",
                padding: "12px 0",
                background: (loading || !agreeRights || !agreeAI || !agreeTOS) ? "rgba(108,240,255,.2)" : "linear-gradient(135deg, #6cf0ff 0%, #a06bff 100%)",
                border: "none",
                borderRadius: 6,
                color: (loading || !agreeRights || !agreeAI || !agreeTOS) ? "rgba(5,6,21,.5)" : "#050615",
                fontWeight: 700,
                fontSize: 15,
                cursor: (loading || !agreeRights || !agreeAI || !agreeTOS) ? "not-allowed" : "pointer",
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
      </div>

      {showTerms && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowTerms(false)} data-testid="modal-terms">
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#0d1229", border: "1px solid rgba(108,240,255,.2)", borderRadius: 12, maxWidth: 560, width: "100%", maxHeight: "80vh", overflow: "auto", padding: 32 }}>
            <h2 style={{ color: "#6cf0ff", fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Terms of Service – Hit Wave Media</h2>
            <div style={{ color: "#aab6e8", fontSize: 14, lineHeight: 1.8 }}>
              <p style={{ marginBottom: 16 }}>Welcome to Hit Wave Media. By accessing or using the Hit Wave Media website and platform, you agree to comply with and be bound by the following Terms of Service. If you do not agree with these terms, you should not use the platform.</p>

              <p style={{ marginBottom: 16 }}>Hit Wave Media is an online platform designed for the discovery, sharing, and promotion of AI-generated music. The platform allows creators to upload music and listeners to discover new creators, trending tracks, and chart rankings.</p>

              <h3 style={{ color: "#a06bff", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>User Content</h3>
              <p style={{ marginBottom: 16 }}>Users are responsible for the content they upload to the platform. By uploading music or other content to Hit Wave Media, you represent and warrant that you own the rights to the content or have the legal permission to share and distribute it. Users may not upload content that infringes on the copyright, trademark, or intellectual property rights of others.</p>

              <h3 style={{ color: "#a06bff", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>AI-Generated Content</h3>
              <p style={{ marginBottom: 16 }}>Hit Wave Media focuses on music created with artificial intelligence tools. Creators are responsible for ensuring their content complies with applicable laws and any licensing requirements associated with the tools or materials used to create their music.</p>

              <h3 style={{ color: "#a06bff", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>License to Content</h3>
              <p style={{ marginBottom: 16 }}>By uploading content to Hit Wave Media, you grant the platform a non-exclusive, worldwide, royalty-free license to host, stream, display, promote, and distribute the content within the platform. This license allows Hit Wave Media to operate the service and showcase creator content to listeners.</p>

              <h3 style={{ color: "#a06bff", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Content Removal</h3>
              <p style={{ marginBottom: 16 }}>Hit Wave Media reserves the right to remove or disable access to any content that violates these terms, infringes on intellectual property rights, or is considered harmful, illegal, abusive, or misleading. Accounts that repeatedly violate these rules may be suspended or permanently removed from the platform.</p>

              <h3 style={{ color: "#a06bff", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Prohibited Activities</h3>
              <p style={{ marginBottom: 16 }}>Users agree not to misuse the platform or attempt to disrupt the service. Activities such as hacking, attempting unauthorized access, manipulating play counts or rankings, uploading malicious software, or interfering with the operation of the website are strictly prohibited.</p>

              <h3 style={{ color: "#a06bff", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Third-Party Links</h3>
              <p style={{ marginBottom: 16 }}>The platform may contain links to external websites or services that are not controlled by Hit Wave Media. Hit Wave Media is not responsible for the content, policies, or practices of third-party websites.</p>

              <h3 style={{ color: "#a06bff", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Disclaimer</h3>
              <p style={{ marginBottom: 16 }}>Hit Wave Media provides the platform on an "as is" and "as available" basis. While we strive to maintain reliable service, we do not guarantee uninterrupted availability or error-free operation of the platform.</p>

              <h3 style={{ color: "#a06bff", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Limitation of Liability</h3>
              <p style={{ marginBottom: 16 }}>To the fullest extent permitted by law, Hit Wave Media shall not be liable for any damages resulting from the use of or inability to use the platform, including but not limited to loss of data, loss of revenue, or other indirect or consequential damages.</p>

              <h3 style={{ color: "#a06bff", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Changes to Terms</h3>
              <p style={{ marginBottom: 16 }}>Hit Wave Media may update or modify these Terms of Service at any time. Continued use of the platform after changes are posted constitutes acceptance of the updated terms.</p>

              <h3 style={{ color: "#a06bff", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Copyright Concerns</h3>
              <p style={{ marginBottom: 16 }}>If you believe that content on Hit Wave Media violates your copyright or intellectual property rights, you may contact us to request removal of the material.</p>

              <h3 style={{ color: "#a06bff", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Contact</h3>
              <p style={{ marginBottom: 16 }}>For questions regarding these Terms of Service or the platform, please contact Hit Wave Media through the contact information provided on the website.</p>

              <p style={{ marginBottom: 0, fontWeight: 600 }}>By using Hit Wave Media, you acknowledge that you have read, understood, and agreed to these Terms of Service.</p>
            </div>
            <button onClick={() => setShowTerms(false)} style={{ width: "100%", padding: "12px 0", background: "linear-gradient(135deg, #6cf0ff 0%, #a06bff 100%)", border: "none", borderRadius: 6, color: "#050615", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 12 }} data-testid="button-close-terms">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
