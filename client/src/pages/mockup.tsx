import mockupImage from "@/assets/images/design-mockup.png";

export default function Mockup() {
  return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: 20 }}>
      <h1 style={{ color: "#6cf0ff", marginBottom: 20, fontSize: 24 }}>Design Mockup - Full Size</h1>
      <img src={mockupImage} alt="Design Mockup" style={{ width: "100%", maxWidth: 1400 }} data-testid="img-mockup" />
    </div>
  );
}
