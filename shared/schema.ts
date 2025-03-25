import { pgTable, text, serial, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model (inherited from the template)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
  foodBankId: integer("foodBankId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  foodBankId: true,
});

// Food bank model for storing organization settings
export const foodBanks = pgTable("foodBanks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  primaryColor: text("primaryColor").default("#0ea5e9"),
  secondaryColor: text("secondaryColor").default("#22c55e"),
  thankYouMessage: text("thankYouMessage").default("Thank you for your generous support! Your contributions make a meaningful difference in our community."),
  thankYouVideoUrl: text("thankYouVideoUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const insertFoodBankSchema = createInsertSchema(foodBanks)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Donor model for storing donor information
export const donors = pgTable("donors", {
  id: serial("id").primaryKey(),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  email: text("email").notNull().unique(),
  totalGiving: numeric("totalGiving").notNull(),
  firstGiftDate: timestamp("firstGiftDate"),
  lastGiftDate: timestamp("lastGiftDate"),
  largestGift: numeric("largestGift"),
  giftCount: integer("giftCount"),
  foodBankId: integer("foodBankId").notNull(),
  impactUrl: text("impactUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const insertDonorSchema = createInsertSchema(donors)
  .omit({ id: true, impactUrl: true, createdAt: true, updatedAt: true });

// User settings table for storing user preferences and customizations
export const userSettings = pgTable("userSettings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  theme: text("theme").default("light").notNull(),
  emailNotifications: boolean("emailNotifications").default(true).notNull(),
  defaultView: text("defaultView").default("dashboard").notNull(),
  dashboardLayout: text("dashboardLayout"), // JSON string of dashboard layout configuration
  customColors: text("customColors"), // JSON string of custom color preferences
  preferredChartType: text("preferredChartType").default("bar"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const insertUserSettingsSchema = createInsertSchema(userSettings)
  .omit({ id: true, createdAt: true, updatedAt: true });

// CSV validation schema for uploaded donor data
export const csvDonorSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  total_giving: z.string().transform((val) => parseFloat(val)),
  first_gift_date: z.string().optional(),
  last_gift_date: z.string().optional(),
  largest_gift: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  gift_count: z.string().optional().transform((val) => val ? parseInt(val) : undefined)
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFoodBank = z.infer<typeof insertFoodBankSchema>;
export type FoodBank = typeof foodBanks.$inferSelect;

export type InsertDonor = z.infer<typeof insertDonorSchema>;
export type Donor = typeof donors.$inferSelect;

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

export type CsvDonor = z.infer<typeof csvDonorSchema>;
