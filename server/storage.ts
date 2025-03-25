import { 
  users, 
  type User, 
  type InsertUser,
  foodBanks,
  type FoodBank,
  type InsertFoodBank,
  donors,
  type Donor,
  type InsertDonor
} from "@shared/schema";

// Storage interface with CRUD methods
export interface IStorage {
  // User methods (from template)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // FoodBank methods
  getFoodBank(id: number): Promise<FoodBank | undefined>;
  createFoodBank(foodBank: InsertFoodBank): Promise<FoodBank>;
  updateFoodBank(id: number, foodBank: Partial<InsertFoodBank>): Promise<FoodBank | undefined>;
  
  // Donor methods
  getDonor(id: number): Promise<Donor | undefined>;
  getDonorByEmail(email: string): Promise<Donor | undefined>;
  getDonorByImpactUrl(impactUrl: string): Promise<Donor | undefined>;
  getDonorsByFoodBankId(foodBankId: number): Promise<Donor[]>;
  createDonor(donor: InsertDonor & { impactUrl?: string }): Promise<Donor>;
  createDonors(donors: (InsertDonor & { impactUrl?: string })[]): Promise<Donor[]>;
  updateDonor(id: number, donor: Partial<InsertDonor & { impactUrl?: string }>): Promise<Donor | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private foodBanks: Map<number, FoodBank>;
  private donors: Map<number, Donor>;
  
  userCurrentId: number;
  foodBankCurrentId: number;
  donorCurrentId: number;

  constructor() {
    this.users = new Map();
    this.foodBanks = new Map();
    this.donors = new Map();
    
    this.userCurrentId = 1;
    this.foodBankCurrentId = 1;
    this.donorCurrentId = 1;
    
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // FoodBank methods
  async getFoodBank(id: number): Promise<FoodBank | undefined> {
    return this.foodBanks.get(id);
  }
  
  async createFoodBank(insertFoodBank: InsertFoodBank): Promise<FoodBank> {
    const id = this.foodBankCurrentId++;
    const foodBank: FoodBank = { 
      id,
      name: insertFoodBank.name,
      logo: insertFoodBank.logo ?? null,
      primaryColor: insertFoodBank.primaryColor ?? null,
      secondaryColor: insertFoodBank.secondaryColor ?? null,
      thankYouMessage: insertFoodBank.thankYouMessage ?? null,
      thankYouVideoUrl: insertFoodBank.thankYouVideoUrl ?? null
    };
    this.foodBanks.set(id, foodBank);
    return foodBank;
  }
  
  async updateFoodBank(id: number, foodBank: Partial<InsertFoodBank>): Promise<FoodBank | undefined> {
    const existingFoodBank = this.foodBanks.get(id);
    if (!existingFoodBank) return undefined;
    
    const updatedFoodBank = { 
      ...existingFoodBank, 
      ...foodBank 
    };
    
    this.foodBanks.set(id, updatedFoodBank);
    return updatedFoodBank;
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
  
  async createDonor(insertDonor: InsertDonor & { impactUrl?: string }): Promise<Donor> {
    const id = this.donorCurrentId++;
    const donor: Donor = { ...insertDonor, id };
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
      ...donor 
    };
    
    this.donors.set(id, updatedDonor);
    return updatedDonor;
  }
}

export const storage = new MemStorage();
