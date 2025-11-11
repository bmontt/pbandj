import React from 'react';
import { Html } from '@react-email/html';

interface Props {
  name: string;
  email: string;
  message?: string;
  trackUrl: string;
  trackName?: string;
}

export default function DemoSubmissionEmail({ name, email, message, trackUrl, trackName }: Props) {
  return (
    <Html>
      <div style={{ background: '#000', color: '#fff', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', padding: 24 }}>
        <div style={{ borderBottom: '1px solid #222', paddingBottom: 12, marginBottom: 12 }}>
          <h1 style={{ color: '#ff0051', margin: 0 }}>PB&J Sounds — New Demo</h1>
        </div>

        <p style={{ color: '#ddd' }}><strong>Artist:</strong> {name}</p>
        <p style={{ color: '#ddd' }}><strong>Email:</strong> {email}</p>
        {message && <p style={{ color: '#ddd' }}><strong>Message:</strong><br />{message}</p>}

        <div style={{ marginTop: 16 }}>
          <a href={trackUrl} style={{ background: '#ff0051', color: '#fff', padding: '10px 14px', borderRadius: 8, textDecoration: 'none' }}>
            Download Track {trackName ? `— ${trackName}` : ''}
          </a>
        </div>

        <footer style={{ marginTop: 24, color: '#888', fontSize: 12 }}>
          PB&J Sounds
        </footer>
      </div>
    </Html>
  );
}
