import * as React from "react"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your learning progress
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Hadiths Read */}
        <div className="rounded-lg border p-4 dark:border-gray-800">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Hadiths Read
            </p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>

        {/* Quizzes Completed */}
        <div className="rounded-lg border p-4 dark:border-gray-800">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Quizzes Completed
            </p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>

        {/* Current Streak */}
        <div className="rounded-lg border p-4 dark:border-gray-800">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Current Streak
            </p>
            <p className="text-2xl font-bold">0 days</p>
          </div>
        </div>

        {/* Points Earned */}
        <div className="rounded-lg border p-4 dark:border-gray-800">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Points Earned
            </p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Recent Activity</h3>
        <div className="rounded-lg border dark:border-gray-800">
          <div className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No recent activity to show. Start learning to see your progress!
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Hadiths */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Recommended Hadiths</h3>
        <div className="rounded-lg border dark:border-gray-800">
          <div className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start exploring Hadiths to get personalized recommendations!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 