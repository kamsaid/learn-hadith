import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { headers } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hadith Learning Platform",
  description: "A modern, gamified e-learning platform for studying Hadith",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies: () => headers().get('cookie') ?? '' })
  
  try {
    await supabase.auth.getSession()
  } catch (error) {
    console.error('Error refreshing auth session:', error)
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
} 