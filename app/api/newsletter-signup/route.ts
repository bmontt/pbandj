import { type NextRequest, NextResponse } from "next/server"
import React from "react"
import { resend } from "@/lib/resend"
import { supabaseServer } from "@/lib/supabase"
import { NewsletterConfirmationEmail } from "@/components/newsletter-confirmation-email"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const { error: dbError } = await supabaseServer.from("newsletter_subscriptions").insert({
      email,
    })

    if (dbError) {
      // If it's a unique constraint error, user already subscribed
      if (dbError.code === "23505") {
        return NextResponse.json({
          success: true,
          message: "Already subscribed",
        })
      }
      console.error("[v0] Database error:", dbError)
      throw new Error("Failed to save subscription")
    }

    const { error: emailError } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "PB&J Sounds <noreply@pbjsounds.com>",
      to: email,
      subject: "Welcome to PB&J Sounds Newsletter",
      react: React.createElement(NewsletterConfirmationEmail, { email }),
    })

    if (emailError) {
      console.error("[v0] Email error:", emailError)
      // Don't fail if email doesn't send - subscription was saved
    }

    return NextResponse.json({
      success: true,
      message: "Successfully signed up for newsletter",
    })
  } catch (error) {
    console.error("[v0] Newsletter signup error:", error)
    return NextResponse.json({ error: "Failed to sign up" }, { status: 500 })
  }
}
