import { cookies } from "next/headers"
import { createServerComponentClient, createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import { getEmbeddings } from "@/lib/deepseek"

// Create a Supabase client for server components
export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerComponentClient({
    cookies: () => cookieStore
  })
}

// Create a Supabase admin client
export function createServerSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Helper function to initialize embeddings for a hadith
export async function initializeHadithEmbeddings(hadithId: string, text: string) {
  try {
    const embeddings = await getEmbeddings(text)
    const supabase = createServerSupabaseAdmin()
    
    const { error } = await supabase
      .from('hadiths')
      .update({ embedding: embeddings })
      .eq('id', hadithId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error initializing embeddings:', error)
    return false
  }
}

// Helper function to get user profile with stats
export async function getUserProfile(userId: string) {
  const supabase = createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      hadiths_read,
      quizzes_completed,
      current_streak,
      points
    `)
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
} 