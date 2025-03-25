import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../shared/schema";

// Create a PostgreSQL connection
const connectionString = process.env.DATABASE_URL || "";
const client = postgres(connectionString, { max: 1 });
export const db = drizzle(client, { schema });

// Initialize database with migrations (can be used during startup)
export async function initializeDatabase() {
  try {
    console.log("Running database migrations...");

    // Create tables based on schema
    await migrate(db, { migrationsFolder: "./drizzle" });

    console.log("Database migrations completed successfully");
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
}

// Helper to check if the database is connected
export async function checkDatabaseConnection() {
  try {
    // Try a simple query to verify connection
    const result = await client`SELECT 1 as connected`;
    return result[0]?.connected === 1;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
}