import { config } from "dotenv"
config({ path: ".env.local" })

import { Pool, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import WS from "ws"
import * as schema from "./schema"

// Sur Vercel (serverless), WebSocket est natif. En local (Node), on a besoin de ws.
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = WS
}
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL manquante")
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const db = drizzle(pool, { schema })
