import { type NextRequest, NextResponse } from "next/server"
import { resend } from "@/lib/resend"
import { supabaseServer } from "@/lib/supabase"
import { DemoSubmissionEmail } from "@/components/demo-submission-email"

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, audioUrl } = await request.json()

    if (!name || !email || !audioUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { error: dbError } = await supabaseServer.from("submissions").insert({
      name,
      email,
      message: message || null,
      audio_url: audioUrl,
    })

    if (dbError) {
      console.error("[v0] Database error:", dbError)
      throw new Error("Failed to save submission")
    }

    const { error: emailError } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "PB&J Sounds <noreply@pbjsounds.com>",
      to: process.env.DEMO_RECIPIENT_EMAIL || "demos@pbjsounds.com",
      subject: `New Demo Submission from ${name}`,
      react: DemoSubmissionEmail({
        name,
        email,
        message,
        audioUrl,
      }),
    })

    if (emailError) {
      console.error("[v0] Email error:", emailError)
      // Don't fail if email doesn't send - submission was saved
    }

    return NextResponse.json({
      success: true,
      message: "Demo submitted successfully",
    })
  } catch (error) {
    console.error("[v0] Submit demo error:", error)
    return NextResponse.json({ error: "Failed to submit demo" }, { status: 500 })
  }
}
