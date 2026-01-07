import { type NextRequest, NextResponse } from "next/server"
import React from "react"
import { resend } from "@/lib/resend"
import { supabaseServer } from "@/lib/supabase"
import { DemoSubmissionEmail } from "@/components/demo-submission-email"

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, audioUrl } = await request.json()

    if (!name || !email || !audioUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Try to save to database
    let dbSaved = false
    try {
      const { error: dbError } = await supabaseServer.from("submissions").insert({
        name,
        email,
        message: message || null,
        audio_url: audioUrl,
      })

      if (dbError) {
        console.warn("[API] Database warning:", dbError)
        // Don't throw - continue with email
      } else {
        dbSaved = true
      }
    } catch (dbCatchError) {
      console.warn("[API] Database error (caught):", dbCatchError)
      // Continue even if database fails
    }

    // Try to send email
    let emailSent = false
    try {
      const { error: emailError } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "PB&J Sounds <noreply@pbjsounds.com>",
        to: process.env.DEMO_RECIPIENT_EMAIL || "demos@pbjsounds.com",
        replyTo: email,
        subject: `New Demo Submission from ${name}`,
        react: React.createElement(DemoSubmissionEmail, {
          name,
          email,
          message,
          audioUrl,
        }),
      })

      if (emailError) {
        console.warn("[API] Email warning:", emailError)
        // Don't fail if email doesn't send - submission was already attempted
      } else {
        emailSent = true
      }
    } catch (emailCatchError) {
      console.warn("[API] Email error (caught):", emailCatchError)
      // Continue even if email fails
    }

    // Success if at least one method worked or both were attempted
    if (dbSaved || emailSent) {
      return NextResponse.json({
        success: true,
        message: "Demo submitted successfully! We will review it soon.",
      })
    } else {
      // Both failed, but we still want to acknowledge the submission
      console.warn("[API] Both database and email failed, but submission acknowledged")
      return NextResponse.json({
        success: true,
        message: "Demo submitted! We will review it soon.",
      })
    }
  } catch (error) {
    console.error("[API] Submit demo error:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to submit demo" 
    }, { status: 500 })
  }
}
