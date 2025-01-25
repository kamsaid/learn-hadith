import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Database } from "@/types/supabase"
import { createClient } from "@supabase/supabase-js"
import { getEmbeddings } from "@/lib/deepseek"

// Create a Supabase client for server components
export const createServerSupabaseClient = () =>
  createServerComponentClient<Database>({
    cookies,
  })

// Create a Supabase admin client for server-side operations
export const createServerSupabaseAdmin = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  )

// Helper function to initialize Hadith embeddings
export const initializeHadithEmbeddings = async (hadithId: string, text: string) => {
  try {
    const embedding = await getEmbeddings(text)
    const supabase = createServerSupabaseAdmin()
    
    const { error } = await supabase
      .from("hadiths")
      .update({ embedding })
      .eq("id", hadithId)

    if (error) throw error
  } catch (error) {
    console.error("Error initializing embeddings:", error)
    throw error
  }
}

// Helper function to get user profile with stats
export const getUserProfile = async (userId: string) => {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      *,
      progress: progress(count),
      favorites: favorites(count),
      quiz_results: quiz_results(count),
      achievements: achievements(count)
    `)
    .eq("id", userId)
    .single()

  if (error) throw error
  return data
} 