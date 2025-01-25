import { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getEmbeddings } from "@/lib/supabase/client"
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/utils/api"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "text" // "text" or "semantic"
    const limit = parseInt(searchParams.get("limit") || "10")
    const page = parseInt(searchParams.get("page") || "1")

    if (!query) {
      return errorResponse("Search query is required", 400)
    }

    const supabase = createServerSupabaseClient()

    if (type === "semantic") {
      // Semantic search using embeddings
      const embedding = await getEmbeddings(query)
      const { data, error } = await supabase.rpc("match_hadiths", {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: limit,
      })

      if (error) throw error
      return successResponse(data)
    } else {
      // Text-based search
      const { data, error } = await supabase
        .from("hadiths")
        .select("*")
        .or(
          `english_text.ilike.%${query}%,` +
          `arabic_text.ilike.%${query}%,` +
          `narrated_by.ilike.%${query}%,` +
          `topics.cs.{${query}}`
        )
        .range((page - 1) * limit, page * limit - 1)
        .order("book_name", { ascending: true })

      if (error) throw error
      return successResponse(data)
    }
  } catch (error) {
    return handleApiError(error)
  }
}

// POST endpoint for initializing embeddings for a Hadith
export async function POST(request: NextRequest) {
  try {
    const { hadithId, text } = await request.json()

    if (!hadithId || !text) {
      return errorResponse("Hadith ID and text are required", 400)
    }

    const embedding = await getEmbeddings(text)
    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from("hadiths")
      .update({ embedding })
      .eq("id", hadithId)

    if (error) throw error

    return successResponse({ message: "Embeddings updated successfully" })
  } catch (error) {
    return handleApiError(error)
  }
} 