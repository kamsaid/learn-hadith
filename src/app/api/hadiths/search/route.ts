import { NextRequest, NextResponse } from "next/server"
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
    const query = searchParams.get("query")
    const type = searchParams.get("type") || "keyword"

    console.log("API: Received search request:", { query, type })

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    console.log("API: Created Supabase client")

    let searchResults

    // Perform text-based search
    if (type === "keyword") {
      console.log("API: Performing keyword search")
      const { data, error } = await supabase
        .from("hadiths")
        .select("id, text, book, narrator, chapter")
        .or(`text.ilike.%${query}%,narrator.ilike.%${query}%,book.ilike.%${query}%`)
        .limit(10)

      if (error) {
        console.error("API: Supabase search error:", error)
        throw error
      }

      console.log("API: Found results:", data?.length || 0)
      searchResults = data
    } else {
      // Search by specific field (narrator or book)
      console.log(`API: Performing ${type} search`)
      const column = type === "narrator" ? "narrator" : "book"
      const { data, error } = await supabase
        .from("hadiths")
        .select("id, text, book, narrator, chapter")
        .ilike(column, `%${query}%`)
        .limit(10)

      if (error) {
        console.error("API: Supabase search error:", error)
        throw error
      }

      console.log("API: Found results:", data?.length || 0)
      searchResults = data
    }

    // If no results found, try a more general search
    if (!searchResults || searchResults.length === 0) {
      console.log("API: No results found, trying general search")
      const { data, error } = await supabase
        .from("hadiths")
        .select("id, text, book, narrator, chapter")
        .or(`text.ilike.%${query}%,narrator.ilike.%${query}%,book.ilike.%${query}%`)
        .limit(10)

      if (error) {
        console.error("API: Supabase general search error:", error)
        throw error
      }

      searchResults = data
      console.log("API: Found results in general search:", data?.length || 0)
    }

    return NextResponse.json(searchResults || [])
  } catch (error) {
    console.error("API: Search error:", error)
    return NextResponse.json(
      { 
        error: "Failed to perform search", 
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
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