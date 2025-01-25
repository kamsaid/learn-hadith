import { getEmbeddings } from "@/lib/deepseek"

async function testEmbeddings() {
  console.log("Testing embeddings...")
  try {
    const text = "In the name of Allah, the Most Gracious, the Most Merciful"
    const embedding = await getEmbeddings(text)
    console.log("✅ Embeddings generated successfully")
    console.log("Embedding length:", embedding.length)
    console.log("First 5 values:", embedding.slice(0, 5))
  } catch (error) {
    console.error("❌ Embeddings test failed:", error)
  }
}

async function runTests() {
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error("❌ DEEPSEEK_API_KEY is not set in environment variables")
    process.exit(1)
  }

  console.log("🧪 Starting DeepSeek API tests...\n")
  await testEmbeddings()
  console.log("\n✨ All tests completed")
}

runTests() 