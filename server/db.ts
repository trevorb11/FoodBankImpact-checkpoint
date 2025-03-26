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
    console.log("Initializing database...");

    // Create tables directly based on schema
    await client`
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
    
    await client`
      CREATE TABLE IF NOT EXISTS "foodBanks" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        logo TEXT,
        "primaryColor" TEXT DEFAULT '#0ea5e9',
        "secondaryColor" TEXT DEFAULT '#22c55e',
        "thankYouMessage" TEXT DEFAULT 'Thank you for your generous support! Your contributions make a meaningful difference in our community.',
        "thankYouVideoUrl" TEXT,
        "defaultAnonymousDonors" BOOLEAN DEFAULT false NOT NULL,
        "defaultShowFullName" BOOLEAN DEFAULT true NOT NULL,
        "defaultShowEmail" BOOLEAN DEFAULT false NOT NULL,
        "defaultAllowSharing" BOOLEAN DEFAULT true NOT NULL,
        "privacyPolicyText" TEXT DEFAULT 'We respect your privacy and will only use your information in accordance with your preferences.',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    
    await client`
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
        "isAnonymous" BOOLEAN DEFAULT false NOT NULL,
        "showFullName" BOOLEAN DEFAULT true NOT NULL,
        "showEmail" BOOLEAN DEFAULT false NOT NULL,
        "allowSharing" BOOLEAN DEFAULT true NOT NULL,
        "optOutDate" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    
    await client`
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

    // Migrate existing tables by adding new columns if they don't exist
    // For foodBanks table
    await client`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public."foodBanks"'::regclass AND attname = 'defaultAnonymousDonors') THEN
          ALTER TABLE "foodBanks" ADD COLUMN "defaultAnonymousDonors" BOOLEAN DEFAULT false NOT NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public."foodBanks"'::regclass AND attname = 'defaultShowFullName') THEN
          ALTER TABLE "foodBanks" ADD COLUMN "defaultShowFullName" BOOLEAN DEFAULT true NOT NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public."foodBanks"'::regclass AND attname = 'defaultShowEmail') THEN
          ALTER TABLE "foodBanks" ADD COLUMN "defaultShowEmail" BOOLEAN DEFAULT false NOT NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public."foodBanks"'::regclass AND attname = 'defaultAllowSharing') THEN
          ALTER TABLE "foodBanks" ADD COLUMN "defaultAllowSharing" BOOLEAN DEFAULT true NOT NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public."foodBanks"'::regclass AND attname = 'privacyPolicyText') THEN
          ALTER TABLE "foodBanks" ADD COLUMN "privacyPolicyText" TEXT DEFAULT 'We respect your privacy and will only use your information in accordance with your preferences.';
        END IF;
      END $$;
    `;
    
    // For donors table
    await client`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.donors'::regclass AND attname = 'isAnonymous') THEN
          ALTER TABLE donors ADD COLUMN "isAnonymous" BOOLEAN DEFAULT false NOT NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.donors'::regclass AND attname = 'showFullName') THEN
          ALTER TABLE donors ADD COLUMN "showFullName" BOOLEAN DEFAULT true NOT NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.donors'::regclass AND attname = 'showEmail') THEN
          ALTER TABLE donors ADD COLUMN "showEmail" BOOLEAN DEFAULT false NOT NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.donors'::regclass AND attname = 'allowSharing') THEN
          ALTER TABLE donors ADD COLUMN "allowSharing" BOOLEAN DEFAULT true NOT NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.donors'::regclass AND attname = 'optOutDate') THEN
          ALTER TABLE donors ADD COLUMN "optOutDate" TIMESTAMP;
        END IF;
      END $$;
    `;

    console.log("Database initialized successfully");
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