import { put } from "@vercel/blob"
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

    // Create signed URL for client-side upload
    const blob = await put(uniqueFilename, new Blob(), {
      access: "public",
    })

    return NextResponse.json({ url: blob.downloadUrl })
  } catch (error) {
    console.error("[v0] Upload URL error:", error)
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 })
  }
}
