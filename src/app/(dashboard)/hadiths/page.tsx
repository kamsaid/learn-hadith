"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useDebounce } from "use-debounce"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Database } from "@/types/supabase"

type Hadith = Database["public"]["Tables"]["hadiths"]["Row"]

export default function HadithsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get("q") || "")
  const [searchType, setSearchType] = React.useState(searchParams.get("type") || "text")
  const [isLoading, setIsLoading] = React.useState(false)
  const [hadiths, setHadiths] = React.useState<Hadith[]>([])
  const [debouncedQuery] = useDebounce(searchQuery, 500)

  React.useEffect(() => {
    if (debouncedQuery) {
      searchHadiths(debouncedQuery, searchType)
    }
  }, [debouncedQuery, searchType])

  const searchHadiths = async (query: string, type: string) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        q: query,
        type,
        limit: "10",
        page: "1",
      })

      const response = await fetch(`/api/hadiths/search?${params}`)
      const data = await response.json()

      if (data.success) {
        setHadiths(data.data)
      }
    } catch (error) {
      console.error("Error searching hadiths:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Browse Hadiths</h1>
        <div className="flex space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search hadiths..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={searchType}
            onValueChange={(value) => setSearchType(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Search type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text Search</SelectItem>
              <SelectItem value="semantic">Semantic Search</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {hadiths.map((hadith) => (
            <div
              key={hadith.id}
              className="rounded-lg border p-6 space-y-4 dark:border-gray-800"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    {hadith.book_name} - Hadith {hadith.hadith_number}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Narrated by {hadith.narrated_by}
                  </p>
                </div>
                {hadith.grade && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    {hadith.grade}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-lg font-arabic" dir="rtl">
                  {hadith.arabic_text}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  {hadith.english_text}
                </p>
              </div>

              <div className="flex space-x-2">
                {hadith.topics?.map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm">
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  Share
                </Button>
              </div>
            </div>
          ))}

          {hadiths.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <p className="text-gray-500">No hadiths found for your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 