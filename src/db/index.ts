import { config } from "dotenv"
config({ path: ".env.local" })

import { Pool, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import * as schema from "./schema"
import ws from "ws"

// Activer WebSocket pour Node.js (plus résilient que HTTP)
neonConfig.webSocketConstructor = ws
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL manquante")
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const db = drizzle(pool, { schema })
