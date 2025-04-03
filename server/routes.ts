import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { csvDonorSchema, insertFoodBankSchema, insertUserSchema, insertUserSettingsSchema } from "@shared/schema";
import crypto from "crypto";
import session from "express-session";
import MemoryStore from "memorystore";

// Extend express-session with custom properties
declare module 'express-session' {
  interface SessionData {
    userId: number;
    foodBankId: number;
  }
}

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  const MemorySessionStore = MemoryStore(session);
  app.use(session({
    secret: 'impact-wrapped-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: new MemorySessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));

  // Auth Routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Start session
      req.session.userId = user.id;
      req.session.foodBankId = user.foodBankId ?? 0; // Handle null foodBankId
      
      return res.status(201).json({ 
        id: user.id, 
        username: user.username,
        role: user.role,
        foodBankId: user.foodBankId
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      }
      return res.status(500).json({ message: 'Failed to register user' });
    }
  });
  
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Start session
      req.session.userId = user.id;
      req.session.foodBankId = user.foodBankId ?? 0; // Handle null foodBankId
      
      return res.status(200).json({ 
        id: user.id, 
        username: user.username,
        role: user.role,
        foodBankId: user.foodBankId
      });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to log in' });
    }
  });
  
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to log out' });
      }
      res.clearCookie('connect.sid');
      return res.status(200).json({ message: 'Logged out successfully' });
    });
  });
  
  app.get('/api/auth/me', isAuthenticated, async (req: Request, res: Response) => {
    try {
      // TypeScript requires non-null assertion because it can't infer from isAuthenticated
      const user = await storage.getUser(req.session.userId!);
      
      if (!user) {
        // This should never happen unless the session is invalid
        req.session.destroy(() => {});
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      return res.status(200).json({
        id: user.id,
        username: user.username,
        role: user.role,
        foodBankId: user.foodBankId
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });
  
  // API Routes - Protected endpoints
  app.get('/api/my-food-bank', isAuthenticated, async (req: Request, res: Response) => {
    try {
      let foodBank = await storage.getFoodBank(req.session.foodBankId!);
      
      if (!foodBank) {
        // Create a default food bank for the user if one doesn't exist
        const user = await storage.getUser(req.session.userId!);
        if (user) {
          foodBank = await storage.createFoodBank({
            name: `${user.username}'s Food Bank`,
            logo: null,
            primaryColor: "#0ea5e9",
            secondaryColor: "#22c55e",
            thankYouMessage: "Thank you for your generous support! Your contributions make a meaningful difference in our community.",
            thankYouVideoUrl: null
          });
          
          // Update user with new food bank ID
          await storage.updateUser(user.id, { foodBankId: foodBank.id });
          
          // Update session
          req.session.foodBankId = foodBank.id;
        } else {
          return res.status(404).json({ message: 'User not found' });
        }
      }
      
      return res.json(foodBank);
    } catch (error) {
      console.error('Error in /api/my-food-bank:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/api/my-food-bank', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const validatedData = insertFoodBankSchema.parse(req.body);
      const updatedFoodBank = await storage.updateFoodBank(req.session.foodBankId!, validatedData);
      
      if (!updatedFoodBank) {
        return res.status(404).json({ message: 'Food bank not found' });
      }
      
      return res.json(updatedFoodBank);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid food bank data', errors: error.errors });
      }
      return res.status(500).json({ message: 'Failed to update food bank' });
    }
  });
  
  app.get('/api/my-donors', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const donors = await storage.getDonorsByFoodBankId(req.session.foodBankId!);
      return res.json(donors);
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });
  
  // User Settings Routes
  app.get('/api/my-settings', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const settings = await storage.getUserSettings(req.session.userId!);
      
      if (!settings) {
        return res.status(404).json({ message: 'User settings not found' });
      }
      
      return res.json(settings);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to get user settings' });
    }
  });
  
  app.post('/api/my-settings', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSettingsSchema.partial().parse(req.body);
      
      // Ensure userId from session is used, not from request body
      delete validatedData.userId;
      
      // Check if user has settings
      let settings = await storage.getUserSettings(req.session.userId!);
      
      if (!settings) {
        // Create new settings
        settings = await storage.createUserSettings({
          ...validatedData,
          userId: req.session.userId!
        });
      } else {
        // Update existing settings
        settings = await storage.updateUserSettings(req.session.userId!, validatedData);
      }
      
      return res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid settings data', errors: error.errors });
      }
      return res.status(500).json({ message: 'Failed to update user settings' });
    }
  });
  
  // Get food bank details
  app.get("/api/food-bank/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid food bank ID" });
    }
    
    const foodBank = await storage.getFoodBank(id);
    
    if (!foodBank) {
      return res.status(404).json({ message: "Food bank not found" });
    }
    
    return res.json(foodBank);
  });
  
  // Update food bank details
  app.post("/api/food-bank/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid food bank ID" });
    }
    
    try {
      const validatedData = insertFoodBankSchema.parse(req.body);
      const updatedFoodBank = await storage.updateFoodBank(id, validatedData);
      
      if (!updatedFoodBank) {
        return res.status(404).json({ message: "Food bank not found" });
      }
      
      return res.json(updatedFoodBank);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid food bank data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update food bank" });
    }
  });
  
  // Process CSV data and create donors
  app.post("/api/donors/upload", async (req: Request, res: Response) => {
    const foodBankId = parseInt(req.body.foodBankId);
    
    if (isNaN(foodBankId)) {
      return res.status(400).json({ message: "Invalid food bank ID" });
    }
    
    const foodBank = await storage.getFoodBank(foodBankId);
    
    if (!foodBank) {
      return res.status(404).json({ message: "Food bank not found" });
    }
    
    try {
      const donorsData = req.body.donors;
      
      if (!Array.isArray(donorsData) || donorsData.length === 0) {
        return res.status(400).json({ message: "Invalid donor data format" });
      }
      
      const processedDonors = [];
      const errors = [];
      const skippedEmails = [];
      
      // First, get all emails that already exist in the database for this food bank
      const existingDonors = await storage.getDonorsByFoodBankId(foodBankId);
      const existingEmails = new Set(existingDonors.map(donor => donor.email.toLowerCase()));
      
      for (let i = 0; i < donorsData.length; i++) {
        try {
          const validatedDonor = csvDonorSchema.parse(donorsData[i]);
          
          // Type assertion to help TypeScript understand the type
          const typedDonor = validatedDonor as {
            first_name: string;
            last_name: string;
            email: string;
            total_giving: number;
            first_gift_date?: string;
            last_gift_date?: string;
            largest_gift?: number;
            gift_count?: number;
            is_anonymous?: boolean;
            show_full_name?: boolean;
            show_email?: boolean;
            allow_sharing?: boolean;
            opt_out_date?: string;
          };
          
          // Check if email already exists in the database
          if (existingEmails.has(typedDonor.email.toLowerCase())) {
            skippedEmails.push({
              row: i + 1,
              email: typedDonor.email,
              name: `${typedDonor.first_name} ${typedDonor.last_name}`
            });
            continue; // Skip this donor and move to the next one
          }
          
          // Create impact URL
          const emailHash = crypto
            .createHash('sha256')
            .update(typedDonor.email)
            .digest('hex')
            .substring(0, 12);
          
          const impactUrl = `${emailHash}`;
          
          // Get food bank privacy defaults to use when CSV doesn't specify
          const foodBank = await storage.getFoodBank(foodBankId);
          
          processedDonors.push({
            firstName: typedDonor.first_name,
            lastName: typedDonor.last_name,
            email: typedDonor.email,
            totalGiving: typedDonor.total_giving.toString(), // Convert to string to match schema
            firstGiftDate: typedDonor.first_gift_date ? new Date(typedDonor.first_gift_date) : undefined,
            lastGiftDate: typedDonor.last_gift_date ? new Date(typedDonor.last_gift_date) : undefined,
            largestGift: typedDonor.largest_gift !== undefined ? typedDonor.largest_gift.toString() : undefined,
            giftCount: typedDonor.gift_count,
            foodBankId,
            impactUrl,
            // Privacy settings with fallbacks to food bank defaults
            isAnonymous: typedDonor.is_anonymous !== undefined ? 
              typedDonor.is_anonymous : 
              (foodBank?.defaultAnonymousDonors || false),
            showFullName: typedDonor.show_full_name !== undefined ? 
              typedDonor.show_full_name : 
              (foodBank?.defaultShowFullName || true),
            showEmail: typedDonor.show_email !== undefined ? 
              typedDonor.show_email : 
              (foodBank?.defaultShowEmail || false),
            allowSharing: typedDonor.allow_sharing !== undefined ? 
              typedDonor.allow_sharing : 
              (foodBank?.defaultAllowSharing || true),
            optOutDate: typedDonor.opt_out_date ? new Date(typedDonor.opt_out_date) : undefined
          });
          
          // Add this email to our set to prevent duplicates within the same file
          existingEmails.add(typedDonor.email.toLowerCase());
          
        } catch (error) {
          if (error instanceof z.ZodError) {
            errors.push({
              row: i + 1,
              errors: error.errors
            });
          } else {
            errors.push({
              row: i + 1,
              errors: [{ message: "Unknown validation error" }]
            });
          }
        }
      }
      
      // Handle case where no records could be processed
      if ((errors.length > 0 || skippedEmails.length > 0) && processedDonors.length === 0) {
        if (skippedEmails.length > 0 && errors.length === 0) {
          return res.status(400).json({ 
            message: "All donor records contain duplicate emails", 
            duplicates: skippedEmails
          });
        } else {
          return res.status(400).json({ 
            message: "All donor records contain validation errors or duplicate emails", 
            errors,
            duplicates: skippedEmails.length > 0 ? skippedEmails : undefined
          });
        }
      }
      
      // Only attempt to create donors if we have at least one valid donor
      let createdDonors = [];
      if (processedDonors.length > 0) {
        createdDonors = await storage.createDonors(processedDonors);
      }
      
      return res.status(201).json({ 
        message: `Successfully processed ${createdDonors.length} donor records`,
        totalProcessed: createdDonors.length,
        skippedDuplicates: skippedEmails.length,
        hasErrors: errors.length > 0 || skippedEmails.length > 0,
        errors: errors.length > 0 ? errors : undefined,
        duplicates: skippedEmails.length > 0 ? skippedEmails : undefined
      });
    } catch (error) {
      console.error('Error processing donor upload:', error);
      return res.status(500).json({ 
        message: "Failed to process donor data", 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get donors by food bank ID
  app.get("/api/donors/food-bank/:id", async (req: Request, res: Response) => {
    const foodBankId = parseInt(req.params.id);
    
    if (isNaN(foodBankId)) {
      return res.status(400).json({ message: "Invalid food bank ID" });
    }
    
    const donors = await storage.getDonorsByFoodBankId(foodBankId);
    return res.json(donors);
  });
  
  // Get donor by impact URL
  app.get("/api/impact/:url", async (req: Request, res: Response) => {
    const url = req.params.url;
    
    const donor = await storage.getDonorByImpactUrl(url);
    
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }
    
    const foodBank = await storage.getFoodBank(donor.foodBankId);
    
    if (!foodBank) {
      return res.status(404).json({ message: "Food bank not found" });
    }
    
    // Check if the donor has opted out completely
    if (donor.optOutDate) {
      return res.status(403).json({ 
        message: "This donor has opted out of sharing their impact data",
        optedOut: true 
      });
    }
    
    // Create a privacy-respecting version of the donor data
    const sanitizedDonor = {
      ...donor,
      // Only include name if allowed
      firstName: donor.isAnonymous ? "Anonymous" : donor.firstName,
      lastName: donor.isAnonymous ? "Donor" : (donor.showFullName ? donor.lastName : ""),
      // Only include email if allowed
      email: donor.showEmail ? donor.email : undefined,
      // Always include donation data
      totalGiving: donor.totalGiving,
      firstGiftDate: donor.firstGiftDate,
      lastGiftDate: donor.lastGiftDate,
      largestGift: donor.largestGift,
      giftCount: donor.giftCount,
      // Include privacy flags for frontend
      allowSharing: donor.allowSharing,
      isAnonymous: donor.isAnonymous
    };
    
    return res.json({ donor: sanitizedDonor, foodBank });
  });

  const httpServer = createServer(app);
  return httpServer;
}
