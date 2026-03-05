import { PageNav } from "@/components/page-nav";

export default function Terms() {
  const sectionStyle: React.CSSProperties = {
    color: "#a06bff",
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 8,
    marginTop: 20,
  };

  const pStyle: React.CSSProperties = {
    marginBottom: 16,
    color: "#aab6e8",
    fontSize: 14,
    lineHeight: 1.8,
  };

  return (
    <div className="hwm-app">
      <div className="bg-lines" />
      <div className="wrap" style={{ paddingTop: 16, maxWidth: 700, margin: "0 auto", paddingBottom: 60 }}>
        <PageNav />
        <section className="panel" style={{ padding: "32px 28px" }}>
          <h1 style={{ color: "#6cf0ff", fontSize: 26, fontWeight: 800, marginBottom: 8, textAlign: "center" }} data-testid="text-terms-title">Terms of Service</h1>
          <p style={{ color: "rgba(170,182,232,.5)", fontSize: 13, textAlign: "center", marginBottom: 28 }}>Hit Wave Media</p>

          <p style={pStyle}>Welcome to Hit Wave Media. By accessing or using the Hit Wave Media website and platform, you agree to comply with and be bound by the following Terms of Service. If you do not agree with these terms, you should not use the platform.</p>

          <p style={pStyle}>Hit Wave Media is an online platform designed for the discovery, sharing, and promotion of AI-generated music. The platform allows creators to upload music and listeners to discover new creators, trending tracks, and chart rankings.</p>

          <h3 style={sectionStyle}>User Content</h3>
          <p style={pStyle}>Users are responsible for the content they upload to the platform. By uploading music or other content to Hit Wave Media, you represent and warrant that you own the rights to the content or have the legal permission to share and distribute it. Users may not upload content that infringes on the copyright, trademark, or intellectual property rights of others.</p>

          <h3 style={sectionStyle}>AI-Generated Content</h3>
          <p style={pStyle}>Hit Wave Media focuses on music created with artificial intelligence tools. Creators are responsible for ensuring their content complies with applicable laws and any licensing requirements associated with the tools or materials used to create their music.</p>

          <h3 style={sectionStyle}>License to Content</h3>
          <p style={pStyle}>By uploading content to Hit Wave Media, you grant the platform a non-exclusive, worldwide, royalty-free license to host, stream, display, promote, and distribute the content within the platform. This license allows Hit Wave Media to operate the service and showcase creator content to listeners.</p>

          <h3 style={sectionStyle}>Content Removal</h3>
          <p style={pStyle}>Hit Wave Media reserves the right to remove or disable access to any content that violates these terms, infringes on intellectual property rights, or is considered harmful, illegal, abusive, or misleading. Accounts that repeatedly violate these rules may be suspended or permanently removed from the platform.</p>

          <h3 style={sectionStyle}>Prohibited Activities</h3>
          <p style={pStyle}>Users agree not to misuse the platform or attempt to disrupt the service. Activities such as hacking, attempting unauthorized access, manipulating play counts or rankings, uploading malicious software, or interfering with the operation of the website are strictly prohibited.</p>

          <h3 style={sectionStyle}>Third-Party Links</h3>
          <p style={pStyle}>The platform may contain links to external websites or services that are not controlled by Hit Wave Media. Hit Wave Media is not responsible for the content, policies, or practices of third-party websites.</p>

          <h3 style={sectionStyle}>Disclaimer</h3>
          <p style={pStyle}>Hit Wave Media provides the platform on an "as is" and "as available" basis. While we strive to maintain reliable service, we do not guarantee uninterrupted availability or error-free operation of the platform.</p>

          <h3 style={sectionStyle}>Limitation of Liability</h3>
          <p style={pStyle}>To the fullest extent permitted by law, Hit Wave Media shall not be liable for any damages resulting from the use of or inability to use the platform, including but not limited to loss of data, loss of revenue, or other indirect or consequential damages.</p>

          <h3 style={sectionStyle}>Changes to Terms</h3>
          <p style={pStyle}>Hit Wave Media may update or modify these Terms of Service at any time. Continued use of the platform after changes are posted constitutes acceptance of the updated terms.</p>

          <h3 style={sectionStyle}>Copyright Concerns</h3>
          <p style={pStyle}>If you believe that content on Hit Wave Media violates your copyright or intellectual property rights, you may contact us to request removal of the material.</p>

          <h3 style={sectionStyle}>Contact</h3>
          <p style={pStyle}>For questions regarding these Terms of Service or the platform, please contact Hit Wave Media through the contact information provided on the website.</p>

          <p style={{ ...pStyle, fontWeight: 600, marginBottom: 0, borderTop: "1px solid rgba(108,240,255,.1)", paddingTop: 20, marginTop: 24 }}>By using Hit Wave Media, you acknowledge that you have read, understood, and agreed to these Terms of Service.</p>
        </section>
      </div>
    </div>
  );
}
