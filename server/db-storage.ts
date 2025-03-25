import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { 
  users, foodBanks, donors, userSettings,
  User, FoodBank, Donor, UserSettings,
  InsertUser, InsertFoodBank, InsertDonor, InsertUserSettings
} from "../shared/schema";
import { IStorage } from "./storage";
import { generateImpactUrlHash } from "../client/src/lib/utils";

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const results = await db.insert(users).values(user).returning();
    
    // Create default user settings
    if (results[0]) {
      await this.createUserSettings({ 
        userId: results[0].id,
        theme: "light",
        emailNotifications: true,
        defaultView: "dashboard"
      });
    }
    
    return results[0];
  }

  // User Settings methods
  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    const results = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return results[0];
  }

  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const results = await db.insert(userSettings).values(settings).returning();
    return results[0];
  }

  async updateUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings | undefined> {
    const results = await db
      .update(userSettings)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId))
      .returning();
    return results[0];
  }

  // FoodBank methods
  async getFoodBank(id: number): Promise<FoodBank | undefined> {
    const results = await db.select().from(foodBanks).where(eq(foodBanks.id, id));
    return results[0];
  }

  async createFoodBank(foodBank: InsertFoodBank): Promise<FoodBank> {
    const results = await db.insert(foodBanks).values(foodBank).returning();
    return results[0];
  }

  async updateFoodBank(id: number, foodBank: Partial<InsertFoodBank>): Promise<FoodBank | undefined> {
    const results = await db
      .update(foodBanks)
      .set({ ...foodBank, updatedAt: new Date() })
      .where(eq(foodBanks.id, id))
      .returning();
    return results[0];
  }

  // Donor methods
  async getDonor(id: number): Promise<Donor | undefined> {
    const results = await db.select().from(donors).where(eq(donors.id, id));
    return results[0];
  }

  async getDonorByEmail(email: string): Promise<Donor | undefined> {
    const results = await db.select().from(donors).where(eq(donors.email, email));
    return results[0];
  }

  async getDonorByImpactUrl(impactUrl: string): Promise<Donor | undefined> {
    const results = await db.select().from(donors).where(eq(donors.impactUrl, impactUrl));
    return results[0];
  }

  async getDonorsByFoodBankId(foodBankId: number): Promise<Donor[]> {
    return await db.select().from(donors).where(eq(donors.foodBankId, foodBankId));
  }

  async createDonor(donor: InsertDonor & { impactUrl?: string }): Promise<Donor> {
    // Generate impact URL if not provided
    const donorWithUrl = { 
      ...donor,
      impactUrl: donor.impactUrl || generateImpactUrlHash(donor.email)
    };
    
    const results = await db.insert(donors).values(donorWithUrl).returning();
    return results[0];
  }

  async createDonors(donorsToCreate: (InsertDonor & { impactUrl?: string })[]): Promise<Donor[]> {
    // Generate impact URLs for all donors that don't have one
    const donorsWithUrls = donorsToCreate.map(donor => ({
      ...donor,
      impactUrl: donor.impactUrl || generateImpactUrlHash(donor.email)
    }));
    
    const results = await db.insert(donors).values(donorsWithUrls).returning();
    return results;
  }

  async updateDonor(id: number, donor: Partial<InsertDonor & { impactUrl?: string }>): Promise<Donor | undefined> {
    const results = await db
      .update(donors)
      .set({ ...donor, updatedAt: new Date() })
      .where(eq(donors.id, id))
      .returning();
    return results[0];
  }
}

// Export a singleton instance
export const dbStorage = new DbStorage();