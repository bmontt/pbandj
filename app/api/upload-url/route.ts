import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json()

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 })
    }

    // Generate a unique filename
    const timestamp = Date.now()
    const uniqueFilename = `demos/${timestamp}-${filename}`

    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      console.error("[API] BLOB_READ_WRITE_TOKEN not configured")
      return NextResponse.json({ error: "Upload service not configured" }, { status: 500 })
    }

    // Return the URL and token separately so client can add proper Authorization header
    const uploadUrl = `https://blob.vercel-storage.com/${uniqueFilename}`
    
    return NextResponse.json({ 
      url: uploadUrl,
      token: token 
    })
  } catch (error) {
    console.error("[API] Upload URL error:", error)
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 })
  }
}
