import "dotenv/config"; // loads .env automatically
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema.js";

const { Pool } = pg;

// Use DATABASE_URL from environment, fallback to dummy DB

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:12345678@localhost:5432/project_management";

let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

try {
  debugger;
  pool = new Pool({ connectionString });
  db = drizzle(pool, { schema });
  console.log("✅ Connected to PostgreSQL:", connectionString);
} catch (err) {
  console.warn(
    "⚠️ Could not connect to PostgreSQL. Backend will run without DB."
  );
}

export { db, pool };
