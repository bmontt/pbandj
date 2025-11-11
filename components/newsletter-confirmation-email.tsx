import type React from "react"

interface NewsletterConfirmationEmailProps {
  email: string
}

export const NewsletterConfirmationEmail: React.FC<NewsletterConfirmationEmailProps> = ({ email }) => (
  <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
    <div
      style={{
        background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
        color: "#fff",
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      <h1 style={{ margin: "0 0 10px 0", fontSize: "28px" }}>PB&J Sounds</h1>
      <p style={{ margin: "0", fontSize: "14px", color: "#ff0051" }}>Newsletter Subscription Confirmed</p>
    </div>

    <div style={{ padding: "40px 20px", background: "#f5f5f5" }}>
      <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>Welcome to the PB&J Sounds Community!</h2>

      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #ddd",
          lineHeight: "1.6",
        }}
      >
        <p>Thank you for subscribing to our newsletter! You'll now receive:</p>
        <ul style={{ paddingLeft: "20px" }}>
          <li>Exclusive event announcements</li>
          <li>Behind-the-scenes content</li>
          <li>New releases and collaborations</li>
          <li>Special opportunities</li>
        </ul>

        <p>We're excited to have you in our community. Stay tuned for updates!</p>
      </div>
    </div>

    <div
      style={{
        background: "#000",
        color: "#999",
        padding: "20px",
        textAlign: "center",
        fontSize: "12px",
      }}
    >
      <p style={{ margin: "0" }}>© {new Date().getFullYear()} PB&J Sounds. All rights reserved.</p>
    </div>
  </div>
)
