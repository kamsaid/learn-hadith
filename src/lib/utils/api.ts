import { NextResponse } from "next/server"

// Types for API responses
export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Success response helper
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  )
}

// Error response helper
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  )
}

// Handle API errors
export function handleApiError(error: any) {
  console.error("API Error:", error)
  const message = error?.message || "An unexpected error occurred"
  return errorResponse(message, error?.status || 500)
}

// Validate request body
export function validateRequestBody<T>(
  body: unknown,
  requiredFields: (keyof T)[]
): body is T {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body")
  }

  for (const field of requiredFields) {
    if (!(field in body)) {
      throw new Error(`Missing required field: ${String(field)}`)
    }
  }

  return true
} 