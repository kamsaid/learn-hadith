import { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getEmbeddings } from "@/lib/deepseek"

// Helper function to select a relevant Hadith based on the query
async function findRelevantHadith(query: string) {
  const supabase = createServerSupabaseClient()
  
  // First try a direct text search
  const { data: directResults, error: directError } = await supabase
    .from('hadiths')
    .select('text, book, narrator, chapter')
    .ilike('text', `%${query}%`)
    .limit(1)

  if (directResults?.length) {
    return directResults[0]
  }

  // If no direct match, try a more general search
  const { data: generalResults, error: generalError } = await supabase
    .from('hadiths')
    .select('text, book, narrator, chapter')
    .limit(1)

  if (generalResults?.length) {
    return generalResults[0]
  }

  return null
}

// Helper function to generate a response using DeepSeek
async function generateResponse(message: string, history: any[], currentHadith: any) {
  try {
    let prompt = ""
    
    if (!currentHadith) {
      // First message - introduce and discuss Islamic topics
      prompt = `As an Islamic scholar, help me understand and discuss Islamic topics. The user's question is: ${message}`
    } else {
      // We have a Hadith - explain and discuss it
      prompt = `As an Islamic scholar, help me understand this Hadith:
      
${currentHadith.text}
Narrated by: ${currentHadith.narrator}
From: ${currentHadith.book}

The user asks: ${message}

Please provide a thoughtful explanation, focusing on:
1. The meaning and context of the Hadith
2. Its relevance to daily life
3. Any specific guidance it offers
4. Related verses from the Quran if applicable`
    }

    // Call DeepSeek API
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a knowledgeable Islamic scholar who provides thoughtful, accurate explanations of Hadiths and Islamic topics." },
          ...history,
          { role: "user", content: prompt }
        ]
      })
    })

    if (!response.ok) {
      throw new Error('Failed to get response from DeepSeek')
    }

    const data = await response.json()
    return data.choices[0].message.content

  } catch (error) {
    console.error('Error generating response:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, history, currentHadith } = body

    // For the first message, find a relevant Hadith
    let hadith = currentHadith
    if (!currentHadith) {
      hadith = await findRelevantHadith(message)
    }

    // Generate response using DeepSeek
    const response = await generateResponse(message, history, hadith)

    return Response.json({
      response,
      hadith: hadith || null
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
} 