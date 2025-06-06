import { 
  users, 
  type User, 
  type InsertUser,
  foodBanks,
  type FoodBank,
  type InsertFoodBank,
  donors,
  type Donor,
  type InsertDonor,
  donorFiles,
  type DonorFile,
  type InsertDonorFile,
  userSettings,
  type UserSettings,
  type InsertUserSettings
} from "@shared/schema";

// Storage interface with CRUD methods
export interface IStorage {
  // User methods (from template)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // User Settings methods
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings | undefined>;
  
  // FoodBank methods
  getFoodBank(id: number): Promise<FoodBank | undefined>;
  createFoodBank(foodBank: InsertFoodBank): Promise<FoodBank>;
  updateFoodBank(id: number, foodBank: Partial<InsertFoodBank>): Promise<FoodBank | undefined>;
  
  // Donor File methods
  getDonorFile(id: number): Promise<DonorFile | undefined>;
  getDonorFilesByFoodBankId(foodBankId: number): Promise<DonorFile[]>;
  createDonorFile(donorFile: InsertDonorFile): Promise<DonorFile>;
  updateDonorFile(id: number, donorFile: Partial<InsertDonorFile>): Promise<DonorFile | undefined>;
  
  // Donor methods
  getDonor(id: number): Promise<Donor | undefined>;
  getDonorByEmail(email: string): Promise<Donor | undefined>;
  getDonorByImpactUrl(impactUrl: string): Promise<Donor | undefined>;
  getDonorsByFoodBankId(foodBankId: number): Promise<Donor[]>;
  getDonorsByFileId(fileId: number): Promise<Donor[]>;
  createDonor(donor: InsertDonor & { impactUrl?: string }): Promise<Donor>;
  createDonors(donors: (InsertDonor & { impactUrl?: string })[]): Promise<Donor[]>;
  updateDonor(id: number, donor: Partial<InsertDonor & { impactUrl?: string }>): Promise<Donor | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private foodBanks: Map<number, FoodBank>;
  private donors: Map<number, Donor>;
  private donorFiles: Map<number, DonorFile>;
  private userSettingsMap: Map<number, UserSettings>;
  
  userCurrentId: number;
  foodBankCurrentId: number;
  donorCurrentId: number;
  donorFileCurrentId: number;
  userSettingsCurrentId: number;

  constructor() {
    this.users = new Map();
    this.foodBanks = new Map();
    this.donors = new Map();
    this.donorFiles = new Map();
    this.userSettingsMap = new Map();
    
    this.userCurrentId = 1;
    this.foodBankCurrentId = 1;
    this.donorCurrentId = 1;
    this.donorFileCurrentId = 1;
    this.userSettingsCurrentId = 1;
    
    // Initialize with a default food bank
    this.createFoodBank({
      name: "Metro Area Food Bank",
      logo: "",
      primaryColor: "#0ea5e9",
      secondaryColor: "#22c55e",
      thankYouMessage: "Your generosity is helping families in our community access nutritious food. Thank you for being part of our mission to fight hunger!",
      thankYouVideoUrl: ""
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    
    // Determine if we need to create a food bank for this user
    let foodBankId = insertUser.foodBankId;
    
    if (!foodBankId) {
      // Create a default food bank for this user
      const foodBank = await this.createFoodBank({
        name: `${insertUser.username}'s Food Bank`,
        logo: null,
        primaryColor: "#0ea5e9",
        secondaryColor: "#22c55e",
        thankYouMessage: "Thank you for your generous support! Your contributions make a meaningful difference in our community.",
        thankYouVideoUrl: null
      });
      foodBankId = foodBank.id;
    }
    
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      role: insertUser.role ?? "admin",
      foodBankId,
      createdAt: now,
      updatedAt: now
    };
    
    this.users.set(id, user);
    
    // Create default user settings for the new user
    await this.createUserSettings({
      userId: id,
      theme: "light",
      emailNotifications: true,
      defaultView: "dashboard"
    });
    
    return user;
  }
  
  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = {
      ...existingUser,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // User Settings methods
  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    return Array.from(this.userSettingsMap.values()).find(
      (settings) => settings.userId === userId
    );
  }
  
  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const id = this.userSettingsCurrentId++;
    const now = new Date();
    
    const userSettings: UserSettings = {
      id,
      userId: settings.userId,
      theme: settings.theme || "light",
      emailNotifications: settings.emailNotifications ?? true,
      defaultView: settings.defaultView || "dashboard",
      dashboardLayout: settings.dashboardLayout || null,
      customColors: settings.customColors || null,
      preferredChartType: settings.preferredChartType || "bar",
      createdAt: now,
      updatedAt: now
    };
    
    this.userSettingsMap.set(id, userSettings);
    return userSettings;
  }
  
  async updateUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings | undefined> {
    const existingSettings = Array.from(this.userSettingsMap.values()).find(
      (s) => s.userId === userId
    );
    
    if (!existingSettings) return undefined;
    
    const updatedSettings = {
      ...existingSettings,
      ...settings,
      updatedAt: new Date()
    };
    
    this.userSettingsMap.set(existingSettings.id, updatedSettings);
    return updatedSettings;
  }
  
  // FoodBank methods
  async getFoodBank(id: number): Promise<FoodBank | undefined> {
    return this.foodBanks.get(id);
  }
  
  async createFoodBank(insertFoodBank: InsertFoodBank): Promise<FoodBank> {
    const id = this.foodBankCurrentId++;
    const now = new Date();
    
    const foodBank: FoodBank = { 
      id,
      name: insertFoodBank.name,
      logo: insertFoodBank.logo ?? null,
      primaryColor: insertFoodBank.primaryColor ?? "#0ea5e9",
      secondaryColor: insertFoodBank.secondaryColor ?? "#22c55e",
      thankYouMessage: insertFoodBank.thankYouMessage ?? "Thank you for your generous support! Your contributions make a meaningful difference in our community.",
      thankYouVideoUrl: insertFoodBank.thankYouVideoUrl ?? null,
      // Privacy defaults
      defaultAnonymousDonors: insertFoodBank.defaultAnonymousDonors ?? false,
      defaultShowFullName: insertFoodBank.defaultShowFullName ?? true,
      defaultShowEmail: insertFoodBank.defaultShowEmail ?? false,
      defaultAllowSharing: insertFoodBank.defaultAllowSharing ?? true,
      privacyPolicyText: insertFoodBank.privacyPolicyText ?? "We respect your privacy and will only use your information in accordance with your preferences.",
      createdAt: now,
      updatedAt: now
    };
    this.foodBanks.set(id, foodBank);
    return foodBank;
  }
  
  async updateFoodBank(id: number, foodBank: Partial<InsertFoodBank>): Promise<FoodBank | undefined> {
    const existingFoodBank = this.foodBanks.get(id);
    if (!existingFoodBank) return undefined;
    
    const updatedFoodBank = { 
      ...existingFoodBank, 
      ...foodBank,
      updatedAt: new Date()
    };
    
    this.foodBanks.set(id, updatedFoodBank);
    return updatedFoodBank;
  }
  
  // Donor File methods
  async getDonorFile(id: number): Promise<DonorFile | undefined> {
    return this.donorFiles.get(id);
  }
  
  async getDonorFilesByFoodBankId(foodBankId: number): Promise<DonorFile[]> {
    return Array.from(this.donorFiles.values()).filter(
      (file) => file.foodBankId === foodBankId
    );
  }
  
  async createDonorFile(donorFile: InsertDonorFile): Promise<DonorFile> {
    const id = this.donorFileCurrentId++;
    const now = new Date();
    
    const newDonorFile: DonorFile = {
      id,
      name: donorFile.name,
      description: donorFile.description ?? null,
      recordCount: donorFile.recordCount,
      foodBankId: donorFile.foodBankId,
      isActive: donorFile.isActive ?? true,
      uploadDate: donorFile.uploadDate ?? now,
      createdAt: now,
      updatedAt: now
    };
    
    this.donorFiles.set(id, newDonorFile);
    return newDonorFile;
  }
  
  async updateDonorFile(id: number, donorFile: Partial<InsertDonorFile>): Promise<DonorFile | undefined> {
    const existingFile = this.donorFiles.get(id);
    if (!existingFile) return undefined;
    
    const updatedFile = {
      ...existingFile,
      ...donorFile,
      updatedAt: new Date()
    };
    
    this.donorFiles.set(id, updatedFile);
    return updatedFile;
  }
  
  // Donor methods
  async getDonor(id: number): Promise<Donor | undefined> {
    return this.donors.get(id);
  }
  
  async getDonorByEmail(email: string): Promise<Donor | undefined> {
    return Array.from(this.donors.values()).find(
      (donor) => donor.email === email,
    );
  }
  
  async getDonorByImpactUrl(impactUrl: string): Promise<Donor | undefined> {
    return Array.from(this.donors.values()).find(
      (donor) => donor.impactUrl === impactUrl,
    );
  }
  
  async getDonorsByFoodBankId(foodBankId: number): Promise<Donor[]> {
    return Array.from(this.donors.values()).filter(
      (donor) => donor.foodBankId === foodBankId,
    );
  }
  
  async getDonorsByFileId(fileId: number): Promise<Donor[]> {
    return Array.from(this.donors.values()).filter(
      (donor) => donor.donorFileId === fileId,
    );
  }
  
  async createDonor(insertDonor: InsertDonor & { impactUrl?: string }): Promise<Donor> {
    const id = this.donorCurrentId++;
    const now = new Date();
    
    const donor: Donor = {
      id,
      firstName: insertDonor.firstName,
      lastName: insertDonor.lastName,
      email: insertDonor.email,
      totalGiving: insertDonor.totalGiving,
      foodBankId: insertDonor.foodBankId,
      donorFileId: insertDonor.donorFileId ?? null,
      firstGiftDate: insertDonor.firstGiftDate ?? null,
      lastGiftDate: insertDonor.lastGiftDate ?? null,
      largestGift: insertDonor.largestGift ?? null,
      giftCount: insertDonor.giftCount ?? null,
      impactUrl: insertDonor.impactUrl ?? null,
      // Privacy settings
      isAnonymous: insertDonor.isAnonymous ?? false,
      showFullName: insertDonor.showFullName ?? true,
      showEmail: insertDonor.showEmail ?? false,
      allowSharing: insertDonor.allowSharing ?? true,
      optOutDate: insertDonor.optOutDate ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.donors.set(id, donor);
    return donor;
  }
  
  async createDonors(insertDonors: (InsertDonor & { impactUrl?: string })[]): Promise<Donor[]> {
    const donors: Donor[] = [];
    
    for (const insertDonor of insertDonors) {
      const donor = await this.createDonor(insertDonor);
      donors.push(donor);
    }
    
    return donors;
  }
  
  async updateDonor(id: number, donor: Partial<InsertDonor & { impactUrl?: string }>): Promise<Donor | undefined> {
    const existingDonor = this.donors.get(id);
    if (!existingDonor) return undefined;
    
    const updatedDonor = { 
      ...existingDonor, 
      ...donor,
      updatedAt: new Date()
    };
    
    this.donors.set(id, updatedDonor);
    return updatedDonor;
  }
}

// Import database storage implementation
import { dbStorage } from './db-storage';

// Export database storage as the main storage
export const storage = dbStorage;
