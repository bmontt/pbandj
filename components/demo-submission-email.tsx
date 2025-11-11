import type React from "react"

interface DemoSubmissionEmailProps {
  name: string
  email: string
  message?: string
  audioUrl: string
}

export const DemoSubmissionEmail: React.FC<DemoSubmissionEmailProps> = ({ name, email, message, audioUrl }) => (
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
      <p style={{ margin: "0", fontSize: "14px", color: "#ff0051" }}>New Demo Submission</p>
    </div>

    <div style={{ padding: "40px 20px", background: "#f5f5f5" }}>
      <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>New submission from {name}</h2>

      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #ddd",
        }}
      >
        <p style={{ marginTop: "0" }}>
          <strong>Artist Name:</strong> {name}
        </p>
        <p>
          <strong>Email:</strong> {email}
        </p>
        {message && (
          <p>
            <strong>Message:</strong>
            <br />
            {message}
          </p>
        )}
        <p style={{ marginBottom: "0" }}>
          <strong>Audio File:</strong>
          <br />
          <a
            href={audioUrl}
            style={{
              color: "#ff0051",
              textDecoration: "none",
              wordBreak: "break-all",
            }}
          >
            {audioUrl}
          </a>
        </p>
      </div>

      <div style={{ textAlign: "center" }}>
        <a
          href={`mailto:${email}?subject=Re: Your PB&J Sounds Demo Submission`}
          style={{
            display: "inline-block",
            padding: "12px 24px",
            background: "#ff0051",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          Reply to Artist
        </a>
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
