"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"

export default function SignUpPage() {
  const supabase = createClientComponentClient()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-[440px] p-4">
        <Auth
          supabaseClient={supabase}
          view="sign_up"
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#0F172A",
                  brandAccent: "#1E293B",
                },
              },
            },
          }}
          theme="dark"
          showLinks={true}
          providers={["google", "github"]}
          redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
        />
      </div>
    </div>
  )
} 