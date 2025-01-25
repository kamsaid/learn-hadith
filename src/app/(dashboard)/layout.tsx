"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/sign-in")
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <span className="font-bold">Hadithal</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/dashboard/hadiths">
                <Button variant="ghost">Hadiths</Button>
              </Link>
              <Link href="/dashboard/quizzes">
                <Button variant="ghost">Quizzes</Button>
              </Link>
              <Link href="/dashboard/progress">
                <Button variant="ghost">Progress</Button>
              </Link>
            </nav>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-sm"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container flex-1 py-6">
        <div className="grid gap-12 md:grid-cols-[200px_1fr]">
          {/* Sidebar */}
          <aside className="hidden w-[200px] flex-col md:flex">
            <nav className="grid items-start gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start">
                  Overview
                </Button>
              </Link>
              <Link href="/dashboard/hadiths">
                <Button variant="ghost" className="w-full justify-start">
                  Browse Hadiths
                </Button>
              </Link>
              <Link href="/dashboard/quizzes">
                <Button variant="ghost" className="w-full justify-start">
                  Take Quiz
                </Button>
              </Link>
              <Link href="/dashboard/progress">
                <Button variant="ghost" className="w-full justify-start">
                  View Progress
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="ghost" className="w-full justify-start">
                  Settings
                </Button>
              </Link>
            </nav>
          </aside>

          {/* Content */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  )
} 