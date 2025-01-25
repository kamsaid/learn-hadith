export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      hadiths: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          book_name: string
          hadith_number: string
          chapter: string | null
          narrated_by: string
          arabic_text: string
          english_text: string
          grade: string | null
          topics: string[] | null
          embedding: number[] | null
          references: {
            book: string
            number: string
            grade?: string
          }[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          book_name: string
          hadith_number: string
          chapter?: string | null
          narrated_by: string
          arabic_text: string
          english_text: string
          grade?: string | null
          topics?: string[] | null
          embedding?: number[] | null
          references?: {
            book: string
            number: string
            grade?: string
          }[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          book_name?: string
          hadith_number?: string
          chapter?: string | null
          narrated_by?: string
          arabic_text?: string
          english_text?: string
          grade?: string | null
          topics?: string[] | null
          embedding?: number[] | null
          references?: {
            book: string
            number: string
            grade?: string
          }[] | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string
          full_name: string | null
          avatar_url: string | null
          website: string | null
          saved_hadiths: string[] | null
          quiz_stats: {
            total_quizzes: number
            correct_answers: number
            streak: number
            last_quiz_date: string | null
          } | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          saved_hadiths?: string[] | null
          quiz_stats?: {
            total_quizzes: number
            correct_answers: number
            streak: number
            last_quiz_date: string | null
          } | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          saved_hadiths?: string[] | null
          quiz_stats?: {
            total_quizzes: number
            correct_answers: number
            streak: number
            last_quiz_date: string | null
          } | null
        }
      }
      progress: {
        Row: {
          id: string
          user_id: string
          hadith_id: string
          status: 'completed' | 'in_progress' | 'not_started'
          last_read: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          hadith_id: string
          status?: 'completed' | 'in_progress' | 'not_started'
          last_read?: string
          created_at?: string
        }
        Update: {
          user_id?: string
          hadith_id?: string
          status?: 'completed' | 'in_progress' | 'not_started'
          last_read?: string
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          hadith_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          hadith_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          hadith_id?: string
          created_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          title: string
          description: string | null
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          time_limit: number | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          time_limit?: number | null
          created_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          time_limit?: number | null
          created_at?: string
        }
      }
      quiz_questions: {
        Row: {
          id: string
          quiz_id: string
          hadith_id: string
          question: string
          options: string[]
          correct_answer: string
          explanation: string | null
          points: number
        }
        Insert: {
          id?: string
          quiz_id: string
          hadith_id: string
          question: string
          options: string[]
          correct_answer: string
          explanation?: string | null
          points?: number
        }
        Update: {
          quiz_id?: string
          hadith_id?: string
          question?: string
          options?: string[]
          correct_answer?: string
          explanation?: string | null
          points?: number
        }
      }
      quiz_results: {
        Row: {
          id: string
          user_id: string
          quiz_id: string
          score: number
          time_spent: number
          completed_at: string
          answers: Json
        }
        Insert: {
          id?: string
          user_id: string
          quiz_id: string
          score: number
          time_spent: number
          completed_at?: string
          answers: Json
        }
        Update: {
          user_id?: string
          quiz_id?: string
          score?: number
          time_spent?: number
          completed_at?: string
          answers?: Json
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          type: string
          name: string
          description: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          name: string
          description: string
          earned_at?: string
        }
        Update: {
          user_id?: string
          type?: string
          name?: string
          description?: string
          earned_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          type: string
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          details: Json
          created_at?: string
        }
        Update: {
          user_id?: string
          type?: string
          details?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_hadiths: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 