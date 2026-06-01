import { Pool } from "pg";

// Neon uses the standard pg driver over a pooled connection string
// The ?sslmode=require in DATABASE_URL handles TLS automatically

const pool =
  global._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}

export const db = pool;