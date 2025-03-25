import { pgTable, text, serial, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model (inherited from the template)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Food bank model for storing organization settings
export const foodBanks = pgTable("foodBanks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  primaryColor: text("primaryColor").default("#0ea5e9"),
  secondaryColor: text("secondaryColor").default("#22c55e"),
  thankYouMessage: text("thankYouMessage").default("Thank you for your generous support! Your contributions make a meaningful difference in our community."),
  thankYouVideoUrl: text("thankYouVideoUrl")
});

export const insertFoodBankSchema = createInsertSchema(foodBanks)
  .omit({ id: true });

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
  impactUrl: text("impactUrl")
});

export const insertDonorSchema = createInsertSchema(donors)
  .omit({ id: true, impactUrl: true });

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

export type CsvDonor = z.infer<typeof csvDonorSchema>;
