import { createClient } from "@supabase/supabase-js"
import { Database } from "@/types/supabase"
import { getEmbeddings } from "@/lib/deepseek"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error("Supabase error:", error)
  return new Error(error.message || "An unexpected error occurred")
}

// Helper function to search hadiths by similarity
export const searchHadithsBySimilarity = async (
  queryText: string,
  matchThreshold = 0.7,
  matchCount = 10
) => {
  try {
    const embedding = await getEmbeddings(queryText)
    const { data, error } = await supabase.rpc("match_hadiths", {
      query_embedding: embedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    })

    if (error) throw error
    return data
  } catch (error) {
    throw handleSupabaseError(error)
  }
} 