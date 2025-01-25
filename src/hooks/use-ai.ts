import { useState } from "react"

interface AIHookOptions {
  onError?: (error: Error) => void
}

interface AIResponse<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
}

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

interface DailyChallenge {
  question: string
  hint: string
  difficulty: "easy" | "medium" | "hard"
}

export function useAI(options: AIHookOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)

  const callAI = async <T>(
    action: string,
    params: Record<string, any>
  ): Promise<AIResponse<T>> => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...params }),
      })

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.statusText}`)
      }

      const { success, data, error } = await response.json()

      if (!success) {
        throw new Error(error || "Unknown error occurred")
      }

      return { data, error: null, isLoading: false }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      options.onError?.(err)
      return { data: null, error: err, isLoading: false }
    } finally {
      setIsLoading(false)
    }
  }

  const getHadithExplanation = async (hadithId: string) => {
    return callAI<{ explanation: string }>("explain", { hadithId })
  }

  const generateQuiz = async (hadithId: string, count: number = 3) => {
    return callAI<{ questions: QuizQuestion[] }>("quiz", { hadithId, count })
  }

  const getRecommendations = async (userId: string, count: number = 5) => {
    return callAI<{ recommendations: string[] }>("recommend", { userId, count })
  }

  const askQuestion = async (question: string, topics: string[]) => {
    return callAI<{ answer: string }>("ask", { question, topics })
  }

  const getDailyChallenge = async (topics: string[]) => {
    return callAI<{ challenge: DailyChallenge }>("challenge", { topics })
  }

  return {
    isLoading,
    getHadithExplanation,
    generateQuiz,
    getRecommendations,
    askQuestion,
    getDailyChallenge,
  }
} 