import { Resend } from 'resend';
import { render } from '@react-email/render';
import DemoSubmissionEmail from '../../../emails/DemoSubmissionEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { name, email, message, trackUrl, trackName } = req.body;
    if (!name || !email || !trackUrl) return res.status(400).json({ error: 'missing fields' });

    const html = render(
      DemoSubmissionEmail({ name, email, message, trackUrl, trackName }) as any
    );

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'PB&J Sounds <noreply@pbjsounds.com>',
      to: process.env.DEMO_RECIPIENT_EMAIL || 'demos@pbjsounds.com',
      subject: `New Demo — ${name}`,
      html,
    });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('submit-demo error', err);
    return res.status(500).json({ error: err.message || 'internal' });
  }
}
