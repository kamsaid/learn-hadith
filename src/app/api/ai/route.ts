import { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import {
  generateHadithExplanation,
  generateQuizQuestions,
  getPersonalizedRecommendations,
  answerUserQuestion,
  generateDailyChallenge,
} from "@/lib/ai"
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/utils/api"

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json()
    const supabase = createServerSupabaseClient()

    switch (action) {
      case "explain": {
        const { hadithId } = params
        const { data: hadith, error } = await supabase
          .from("hadiths")
          .select("*")
          .eq("id", hadithId)
          .single()

        if (error) throw error
        if (!hadith) return errorResponse("Hadith not found", 404)

        const explanation = await generateHadithExplanation(hadith)
        return successResponse({ explanation })
      }

      case "quiz": {
        const { hadithId, count } = params
        const { data: hadith, error } = await supabase
          .from("hadiths")
          .select("*")
          .eq("id", hadithId)
          .single()

        if (error) throw error
        if (!hadith) return errorResponse("Hadith not found", 404)

        const questions = await generateQuizQuestions(hadith, count)
        return successResponse({ questions })
      }

      case "recommend": {
        const { userId, count } = params
        const { data: recentHadiths, error } = await supabase
          .from("progress")
          .select("hadiths(*)")
          .eq("user_id", userId)
          .order("last_read", { ascending: false })
          .limit(10)

        if (error) throw error

        const hadiths = recentHadiths
          .map((p) => p.hadiths)
          .filter((h): h is NonNullable<typeof h> => Boolean(h))

        const recommendations = await getPersonalizedRecommendations(
          userId,
          hadiths,
          count
        )
        return successResponse({ recommendations })
      }

      case "ask": {
        const { question, topics } = params
        const { data: relatedHadiths, error } = await supabase
          .from("hadiths")
          .select("*")
          .contains("topics", topics)
          .limit(5)

        if (error) throw error

        const answer = await answerUserQuestion(question, relatedHadiths)
        return successResponse({ answer })
      }

      case "challenge": {
        const { topics } = params
        const challenge = await generateDailyChallenge(topics)
        return successResponse({ challenge })
      }

      default:
        return errorResponse("Invalid action", 400)
    }
  } catch (error) {
    return handleApiError(error)
  }
} 