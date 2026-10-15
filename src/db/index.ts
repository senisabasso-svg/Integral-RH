import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "Falta DATABASE_URL. Ejemplo: postgresql://postgres:postgres@localhost:5432/integral_rh",
  );
}

const globalConDb = globalThis as unknown as { poolPg?: Pool };
const pool = globalConDb.poolPg ?? new Pool({ connectionString: url });
if (process.env.NODE_ENV !== "production") globalConDb.poolPg = pool;

export const db = drizzle(pool);
