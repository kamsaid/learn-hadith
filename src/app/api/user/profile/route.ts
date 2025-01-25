import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextRequest } from "next/server"
import {
  successResponse,
  errorResponse,
  handleApiError,
  validateRequestBody,
} from "@/lib/utils/api"

// GET /api/user/profile - Get user profile
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return errorResponse("Unauthorized", 401)
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(`
        *,
        progress: progress(count),
        favorites: favorites(count),
        quiz_results: quiz_results(count),
        achievements: achievements(count)
      `)
      .eq("id", session.user.id)
      .single()

    if (error) {
      return errorResponse("Profile not found", 404)
    }

    return successResponse(profile)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/user/profile - Create or update user profile
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return errorResponse("Unauthorized", 401)
    }

    const body = await request.json()

    // Validate request body
    type ProfileData = {
      username?: string
    }

    try {
      validateRequestBody<ProfileData>(body, [])
    } catch (error) {
      return errorResponse((error as Error).message, 400)
    }

    // Create or update profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .upsert({
        id: session.user.id,
        username: body.username,
      })
      .select()
      .single()

    if (error) {
      return errorResponse("Failed to update profile", 400)
    }

    return successResponse(profile, "Profile updated successfully")
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/user/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return errorResponse("Unauthorized", 401)
    }

    const body = await request.json()

    // Validate request body
    type UpdateData = {
      username?: string
      points?: number
      streak?: number
    }

    try {
      validateRequestBody<UpdateData>(body, [])
    } catch (error) {
      return errorResponse((error as Error).message, 400)
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        username: body.username,
        points: body.points,
        streak: body.streak,
      })
      .eq("id", session.user.id)
      .select()
      .single()

    if (error) {
      return errorResponse("Failed to update profile", 400)
    }

    return successResponse(profile, "Profile updated successfully")
  } catch (error) {
    return handleApiError(error)
  }
} 