// Types for DeepSeek API responses
interface DeepSeekEmbeddingResponse {
  data: {
    embedding: number[]
    index: number
    object: string
  }[]
  model: string
  object: string
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
}

interface DeepSeekChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Helper function to handle API errors
const handleDeepSeekError = (error: any) => {
  console.error("DeepSeek API error:", error)
  throw new Error(error.message || "An error occurred while calling DeepSeek API")
}

// Get embeddings for a text using DeepSeek API
export async function getEmbeddings(text: string): Promise<number[]> {
  try {
    const response = await fetch("https://api.deepseek.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        input: text,
        model: "deepseek-embed",
      }),
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`)
    }

    const data = (await response.json()) as DeepSeekEmbeddingResponse
    return data.data[0].embedding
  } catch (error) {
    return handleDeepSeekError(error)
  }
}

// Chat completion using DeepSeek API
export async function chatCompletion(
  messages: { role: string; content: string }[],
  options: {
    stream?: boolean
    temperature?: number
    max_tokens?: number
  } = {}
): Promise<DeepSeekChatResponse> {
  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        stream: options.stream ?? false,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 1000,
      }),
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    return handleDeepSeekError(error)
  }
}

// Stream chat completion using DeepSeek API
export async function streamChatCompletion(
  messages: { role: string; content: string }[],
  onChunk: (chunk: string) => void,
  options: {
    temperature?: number
    max_tokens?: number
  } = {}
): Promise<void> {
  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        stream: true,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 1000,
      }),
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error("Failed to get response reader")
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk
        .split("\n")
        .filter((line) => line.trim().startsWith("data: "))

      for (const line of lines) {
        const json = JSON.parse(line.replace("data: ", ""))
        const content = json.choices[0]?.delta?.content || ""
        if (content) onChunk(content)
      }
    }
  } catch (error) {
    handleDeepSeekError(error)
  }
} 