import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { errorResponse, handleApiError } from "@/lib/utils/api"

// Webhook secret from Clerk Dashboard
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

export async function POST(req: Request) {
  try {
    // Get the headers
    const headerPayload = headers()
    const svix_id = headerPayload.get("svix-id")
    const svix_timestamp = headerPayload.get("svix-timestamp")
    const svix_signature = headerPayload.get("svix-signature")

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return errorResponse("Missing svix headers", 400)
    }

    // Get the body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // Create a new Svix instance with your secret
    const wh = new Webhook(webhookSecret || "")

    let evt: WebhookEvent

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent
    } catch (err) {
      console.error("Error verifying webhook:", err)
      return errorResponse("Error verifying webhook", 400)
    }

    // Handle the webhook
    const eventType = evt.type

    if (eventType === "user.created") {
      const { id, email_addresses, username } = evt.data

      // Create a new user profile
      await prisma.userProfile.create({
        data: {
          userId: id,
          username: username || email_addresses[0]?.email_address?.split("@")[0],
        },
      })

      return new Response("User profile created", { status: 201 })
    }

    // Handle user deletion
    if (eventType === "user.deleted") {
      const { id } = evt.data

      // Delete the user profile and all related data
      await prisma.userProfile.delete({
        where: { userId: id },
      })

      return new Response("User profile deleted", { status: 200 })
    }

    return new Response("Webhook received", { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
} 