import { chatCompletion } from "@/lib/deepseek"
import { Database } from "@/types/supabase"

type Hadith = Database["public"]["Tables"]["hadiths"]["Row"]

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

export async function generateHadithExplanation(hadith: Hadith): Promise<string> {
  const prompt = `
    As a knowledgeable Islamic scholar, please provide a clear and concise explanation of the following Hadith:
    
    Arabic Text: ${hadith.arabic_text}
    English Translation: ${hadith.english_text}
    Narrator: ${hadith.narrated_by}
    
    Please include:
    1. Context and background (if relevant)
    2. Main lessons and benefits
    3. Practical applications in modern life
    
    Keep the explanation clear and accessible for learners.
  `

  const response = await chatCompletion([
    {
      role: "system",
      content: "You are a knowledgeable Islamic scholar specializing in Hadith explanation.",
    },
    { role: "user", content: prompt },
  ])

  return response.choices[0].message.content
}

export async function generateQuizQuestions(hadith: Hadith, count: number = 3): Promise<QuizQuestion[]> {
  const prompt = `
    Based on the following Hadith, generate ${count} multiple-choice questions:
    
    Hadith: ${hadith.english_text}
    
    For each question, provide:
    1. The question text
    2. Four possible options (A, B, C, D)
    3. The correct answer
    4. A brief explanation of why it's correct
    
    Format your response as a JSON array with objects containing:
    {
      "question": "question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "correct option",
      "explanation": "explanation text"
    }
  `

  const response = await chatCompletion([
    {
      role: "system",
      content: "You are an expert in creating educational assessments for Islamic studies.",
    },
    { role: "user", content: prompt },
  ])

  try {
    return JSON.parse(response.choices[0].message.content)
  } catch (error) {
    console.error("Error parsing quiz questions:", error)
    throw new Error("Failed to generate quiz questions")
  }
}

export async function getPersonalizedRecommendations(
  userId: string,
  recentHadiths: Hadith[],
  count: number = 5
): Promise<string[]> {
  const recentTopics = recentHadiths
    .flatMap((h) => h.topics || [])
    .filter((t): t is string => Boolean(t))

  const prompt = `
    Based on the user's recent learning history focusing on topics: ${recentTopics.join(", ")}
    
    Please recommend ${count} related topics or subjects they might be interested in studying next.
    Consider:
    1. Natural progression of learning
    2. Related themes and concepts
    3. Increasing complexity
    
    Format your response as a JSON array of topic strings.
  `

  const response = await chatCompletion([
    {
      role: "system",
      content: "You are an expert in Islamic education and personalized learning.",
    },
    { role: "user", content: prompt },
  ])

  try {
    return JSON.parse(response.choices[0].message.content)
  } catch (error) {
    console.error("Error parsing recommendations:", error)
    throw new Error("Failed to generate recommendations")
  }
}

export async function answerUserQuestion(
  question: string,
  relatedHadiths: Hadith[]
): Promise<string> {
  const hadithContext = relatedHadiths
    .map(
      (h) => `
    Hadith from ${h.book_name}:
    ${h.english_text}
    Narrated by: ${h.narrated_by}
    `
    )
    .join("\n")

  const prompt = `
    Please answer the following question about Islam:
    "${question}"
    
    Based on these relevant Hadiths:
    ${hadithContext}
    
    Provide a clear, accurate answer that:
    1. Directly addresses the question
    2. References the relevant Hadiths
    3. Explains the reasoning
    4. Notes any scholarly consensus or differences of opinion (if relevant)
  `

  const response = await chatCompletion([
    {
      role: "system",
      content: "You are a knowledgeable Islamic scholar providing guidance based on authentic sources.",
    },
    { role: "user", content: prompt },
  ])

  return response.choices[0].message.content
}

export async function generateDailyChallenge(topics: string[]): Promise<{
  question: string
  hint: string
  difficulty: "easy" | "medium" | "hard"
}> {
  const prompt = `
    Generate a daily challenge question about the following Islamic topics: ${topics.join(", ")}
    
    The challenge should:
    1. Test understanding and application
    2. Be engaging and thought-provoking
    3. Include a helpful hint
    4. Have an assigned difficulty level
    
    Format your response as a JSON object with:
    {
      "question": "challenge question",
      "hint": "helpful hint",
      "difficulty": "easy|medium|hard"
    }
  `

  const response = await chatCompletion([
    {
      role: "system",
      content: "You are an expert in creating engaging educational content for Islamic studies.",
    },
    { role: "user", content: prompt },
  ])

  try {
    return JSON.parse(response.choices[0].message.content)
  } catch (error) {
    console.error("Error parsing daily challenge:", error)
    throw new Error("Failed to generate daily challenge")
  }
} 