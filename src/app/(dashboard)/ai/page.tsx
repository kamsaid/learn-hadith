"use client"

import * as React from "react"
import { useAI } from "@/hooks/use-ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AITestPage() {
  const { isLoading, getHadithExplanation, generateQuiz, askQuestion } = useAI({
    onError: (error) => {
      console.error("AI Error:", error)
      // You can add toast notification here
    },
  })

  const [hadithId, setHadithId] = React.useState("")
  const [question, setQuestion] = React.useState("")
  const [topics, setTopics] = React.useState("")
  const [result, setResult] = React.useState<any>(null)

  const handleExplanation = async () => {
    const response = await getHadithExplanation(hadithId)
    setResult(response.data)
  }

  const handleQuiz = async () => {
    const response = await generateQuiz(hadithId, 3)
    setResult(response.data)
  }

  const handleQuestion = async () => {
    const topicsList = topics.split(",").map((t) => t.trim())
    const response = await askQuestion(question, topicsList)
    setResult(response.data)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">AI Features Test</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Hadith Explanation */}
        <Card>
          <CardHeader>
            <CardTitle>Get Hadith Explanation</CardTitle>
            <CardDescription>
              Enter a Hadith ID to get an AI-generated explanation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Enter Hadith ID"
                value={hadithId}
                onChange={(e) => setHadithId(e.target.value)}
              />
              <Button
                onClick={handleExplanation}
                disabled={isLoading || !hadithId}
              >
                {isLoading ? "Loading..." : "Get Explanation"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generate Quiz */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Quiz</CardTitle>
            <CardDescription>
              Generate quiz questions based on a Hadith
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Enter Hadith ID"
                value={hadithId}
                onChange={(e) => setHadithId(e.target.value)}
              />
              <Button onClick={handleQuiz} disabled={isLoading || !hadithId}>
                {isLoading ? "Loading..." : "Generate Quiz"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ask Question */}
        <Card>
          <CardHeader>
            <CardTitle>Ask a Question</CardTitle>
            <CardDescription>
              Ask a question about Islam with relevant topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter your question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <Input
                placeholder="Enter topics (comma-separated)"
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
              />
              <Button
                onClick={handleQuestion}
                disabled={isLoading || !question || !topics}
              >
                {isLoading ? "Loading..." : "Ask Question"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>AI response will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-lg">
              {result ? JSON.stringify(result, null, 2) : "No results yet"}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 