import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * POST /api/upload-url
 * Expects JSON { filename }
 * Returns { uploadUrl, downloadUrl }
 * Uses VERCEL_BLOB_READ_WRITE_TOKEN (set in Vercel env)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename } = body || {};
    if (!filename) return NextResponse.json({ error: 'filename required' }, { status: 400 });

    const token = process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
    if (!token) return NextResponse.json({ error: 'VERCEL_BLOB_READ_WRITE_TOKEN not set' }, { status: 500 });

    const name = `demos/${Date.now()}-${filename}`;

    const resp = await fetch('https://api.vercel.com/v1/blob', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, access: 'public' }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('Vercel blob create failed', resp.status, text);
      return NextResponse.json({ error: 'failed to create blob' }, { status: 500 });
    }

    const data = await resp.json();
    // Expected shape: { id, uploadURL, url }
    const uploadUrl = data.uploadURL || data.uploadUrl || data.upload_url || null;
    const downloadUrl = data.url || data.downloadUrl || null;

    return NextResponse.json({ uploadUrl, downloadUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
