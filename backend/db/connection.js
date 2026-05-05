import dotenv from "dotenv"
import { MongoClient } from "mongodb"

dotenv.config()

let db
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/test-assesment-autobizz"

console.log("MongoDB URI:", mongoUri)

export async function connectDB() {
  try {
    const client = new MongoClient(mongoUri)
    await client.connect()
    db = client.db("e-study")
    console.log("Connected to MongoDB")

    // Initialize collections and seed data
    // await initializeDatabase()

    return db
  } catch (error) {
    console.error("MongoDB connection failed:", error)
    process.exit(1)
  }
}

export function getDB() {
  if (!db) {
    throw new Error("Database not connected")
  }
  return db
}