import { Home, ArrowLeft } from "lucide-react";
import siteLogo from "@assets/ChatGPT_Image_Feb_25,_2026,_02_42_25_AM_1772012848904.png";

export function PageNav() {
  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      marginBottom: 8,
      background: "rgba(15,20,40,.6)",
      borderRadius: 12,
      border: "1px solid rgba(108,240,255,.08)",
    }} data-testid="nav-page-header">
      <a
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
          color: "#6cf0ff",
          fontSize: "0.9rem",
          fontWeight: 700,
          padding: "8px 14px",
          borderRadius: 8,
          background: "rgba(108,240,255,.08)",
          border: "1px solid rgba(108,240,255,.15)",
        }}
        data-testid="link-home"
      >
        <ArrowLeft size={18} />
        <span>Home</span>
      </a>
      <a href="/" style={{ display: "flex", alignItems: "center" }} data-testid="link-logo-home">
        <img src={siteLogo} alt="Hit Wave Media" style={{ height: 32, borderRadius: 6 }} />
      </a>
    </nav>
  );
}
