"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"

export default function SignInPage() {
  const supabase = createClientComponentClient()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-[400px] px-8">
        <Auth
          supabaseClient={supabase}
          view="sign_in"
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          showLinks={true}
          providers={["github"]}
          redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`}
        />
      </div>
    </div>
  )
} 