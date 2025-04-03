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
  // Privacy defaults
  defaultAnonymousDonors: boolean("defaultAnonymousDonors").default(false).notNull(),
  defaultShowFullName: boolean("defaultShowFullName").default(true).notNull(),
  defaultShowEmail: boolean("defaultShowEmail").default(false).notNull(),
  defaultAllowSharing: boolean("defaultAllowSharing").default(true).notNull(),
  privacyPolicyText: text("privacyPolicyText").default("We respect your privacy and will only use your information in accordance with your preferences."),
  // Impact equivalencies - default values based on Feeding America metrics
  dollarsPerMeal: numeric("dollarsPerMeal").default("0.20").notNull(),
  mealsPerPerson: numeric("mealsPerPerson").default("3").notNull(),
  poundsPerMeal: numeric("poundsPerMeal").default("1.2").notNull(),
  co2PerPound: numeric("co2PerPound").default("2.5").notNull(),
  waterPerPound: numeric("waterPerPound").default("108").notNull(),
  // Track record creation and updates
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
  // Privacy controls
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  showFullName: boolean("showFullName").default(true).notNull(),
  showEmail: boolean("showEmail").default(false).notNull(),
  allowSharing: boolean("allowSharing").default(true).notNull(),
  optOutDate: timestamp("optOutDate"), // When the donor opted out of sharing
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
  total_giving: z.preprocess(
    (val) => typeof val === 'string' ? parseFloat(val.replace(/[$,]/g, '')) : val, 
    z.number().nonnegative("Total giving must be a positive number")
  ),
  first_gift_date: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().optional()
  ),
  last_gift_date: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().optional()
  ),
  largest_gift: z.preprocess(
    (val) => {
      if (val === '' || val === undefined || val === null) return undefined;
      if (typeof val === 'string') return parseFloat(val.replace(/[$,]/g, ''));
      return val;
    },
    z.number().refine(n => n >= 0, "Largest gift must be a positive number").optional()
  ),
  gift_count: z.preprocess(
    (val) => {
      if (val === '' || val === undefined || val === null) return undefined;
      if (typeof val === 'string') return parseInt(val);
      return val;
    },
    z.number().int().refine(n => n >= 0, "Gift count must be a positive integer").optional()
  ),
  // Privacy settings
  is_anonymous: z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === '') return undefined;
      return val === "true" || val === "1" || val === "yes" || val === true;
    },
    z.boolean().optional()
  ),
  show_full_name: z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === '') return undefined;
      return !(val === "false" || val === "0" || val === "no" || val === false);
    },
    z.boolean().optional()
  ),
  show_email: z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === '') return undefined;
      return val === "true" || val === "1" || val === "yes" || val === true;
    },
    z.boolean().optional()
  ),
  allow_sharing: z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === '') return undefined;
      return !(val === "false" || val === "0" || val === "no" || val === false);
    },
    z.boolean().optional()
  ),
  opt_out_date: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().optional()
  )
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
