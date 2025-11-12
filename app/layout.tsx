import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Cinzel } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const cinzel = Cinzel({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cinzel"
})

export const metadata: Metadata = {
  title: "PB&J",
  description: "East coast-based music collective and record label focused on bringing underground uk/minimal house to the forefront of electronic music.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/pbj_logo_white.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/pbj_logo_black.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/pbj_logo_transparent.png",
        type: "image/svg+xml",
      },
    ],
    apple: "/pbj_logo_white.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${cinzel.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
