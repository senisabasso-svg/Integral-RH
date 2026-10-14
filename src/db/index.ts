import { mkdirSync } from "node:fs";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const url = process.env.DATABASE_URL ?? "file:data/integral-rh.db";

if (url.startsWith("file:")) mkdirSync("data", { recursive: true });

const globalConDb = globalThis as unknown as { clienteDb?: Client };
const cliente = globalConDb.clienteDb ?? createClient({ url });
if (process.env.NODE_ENV !== "production") globalConDb.clienteDb = cliente;

export const db = drizzle(cliente);
