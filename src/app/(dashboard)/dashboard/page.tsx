"use client"

import * as React from "react"
import { Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Types for messages
interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface CurrentHadith {
  text: string
  book: string
  narrator: string
  chapter?: string
}

export default function DashboardPage() {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [inputMessage, setInputMessage] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [currentHadith, setCurrentHadith] = React.useState<CurrentHadith | null>(null)
  
  // Stats
  const [stats, setStats] = React.useState({
    hadithsRead: 0,
    quizzesCompleted: 0,
    currentStreak: 0,
    pointsEarned: 0
  })

  const supabase = createClientComponentClient()

  // Fetch user stats
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.id) {
          // First, check if profile exists
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("hadiths_read, quizzes_completed, current_streak, points")
            .eq("id", session.user.id)
            .maybeSingle()

          if (error) {
            console.error("Error fetching profile:", error)
            return
          }

          if (!profile) {
            // Create new profile if it doesn't exist
            const { data: newProfile, error: upsertError } = await supabase
              .from("profiles")
              .upsert({
                id: session.user.id,
                hadiths_read: 0,
                quizzes_completed: 0,
                current_streak: 0,
                points: 0
              })
              .select()
              .single()

            if (upsertError) {
              console.error("Error creating profile:", upsertError)
              return
            }

            console.log("Created new profile:", newProfile)
            
            // Set stats with new profile data
            setStats({
              hadithsRead: newProfile.hadiths_read || 0,
              quizzesCompleted: newProfile.quizzes_completed || 0,
              currentStreak: newProfile.current_streak || 0,
              pointsEarned: newProfile.points || 0
            })
          } else {
            console.log("Found existing profile:", profile)
            
            // Set stats with existing profile data
            setStats({
              hadithsRead: profile.hadiths_read || 0,
              quizzesCompleted: profile.quizzes_completed || 0,
              currentStreak: profile.current_streak || 0,
              pointsEarned: profile.points || 0
            })
          }
        }
      } catch (error) {
        console.error("Error in profile management:", error)
      }
    }
    fetchStats()
  }, [supabase])

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    setIsLoading(true)
    const newMessage: Message = { role: 'user', content: inputMessage }
    setMessages(prev => [...prev, newMessage])
    setInputMessage("")

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          history: messages,
          currentHadith: currentHadith
        })
      })

      if (!response.ok) throw new Error('Failed to get response')
      
      const data = await response.json()
      
      // If this is the first message, set the Hadith
      if (!currentHadith && data.hadith) {
        setCurrentHadith(data.hadith)
      }

      // Add assistant's response to messages
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col gap-8 h-[calc(100vh-4rem)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground">
          Ask questions about Hadiths or discuss Islamic topics
        </p>
      </div>

      {/* Current Hadith Display */}
      {currentHadith && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="mb-2 font-medium">{currentHadith.text}</p>
            <p className="text-sm text-muted-foreground">
              {currentHadith.book} • {currentHadith.narrator}
              {currentHadith.chapter && ` • ${currentHadith.chapter}`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-lg border bg-background">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground ml-4'
                  : 'bg-muted mr-4'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3 mr-4">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about the Hadith or any Islamic topic..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hadiths Read</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hadithsRead}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.quizzesCompleted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak} days</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pointsEarned}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 