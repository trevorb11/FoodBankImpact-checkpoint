// This script pushes the schema to the database without using migrations
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../shared/schema.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
  console.log("Starting database schema push...");
  
  // Get connection string from environment variable
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error("DATABASE_URL environment variable not set");
    process.exit(1);
  }
  
  // Connect to database
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql, { schema });
  
  try {
    console.log("Pushing schema to database...");
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        "foodBankId" INTEGER,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log("Created users table");
    
    // Create foodBanks table
    await sql`
      CREATE TABLE IF NOT EXISTS "foodBanks" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        logo TEXT,
        "primaryColor" TEXT DEFAULT '#0ea5e9',
        "secondaryColor" TEXT DEFAULT '#22c55e',
        "thankYouMessage" TEXT DEFAULT 'Thank you for your generous support! Your contributions make a meaningful difference in our community.',
        "thankYouVideoUrl" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log("Created foodBanks table");
    
    // Create donors table
    await sql`
      CREATE TABLE IF NOT EXISTS donors (
        id SERIAL PRIMARY KEY,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        "totalGiving" NUMERIC NOT NULL,
        "firstGiftDate" TIMESTAMP,
        "lastGiftDate" TIMESTAMP,
        "largestGift" NUMERIC,
        "giftCount" INTEGER,
        "foodBankId" INTEGER NOT NULL,
        "impactUrl" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log("Created donors table");
    
    // Create userSettings table
    await sql`
      CREATE TABLE IF NOT EXISTS "userSettings" (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL UNIQUE,
        theme TEXT NOT NULL DEFAULT 'light',
        "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
        "defaultView" TEXT NOT NULL DEFAULT 'dashboard',
        "dashboardLayout" TEXT,
        "customColors" TEXT,
        "preferredChartType" TEXT DEFAULT 'bar',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log("Created userSettings table");
    
    console.log("Schema push completed successfully");
  } catch (error) {
    console.error("Schema push failed:", error);
    process.exit(1);
  }
  
  // Close connection
  await sql.end();
  console.log("Database connection closed");
}

main();