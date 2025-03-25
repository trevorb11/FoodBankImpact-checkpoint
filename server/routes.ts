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
      req.session.foodBankId = user.foodBankId;
      
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
      req.session.foodBankId = user.foodBankId;
      
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
      const user = await storage.getUser(req.session.userId);
      
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
      let foodBank = await storage.getFoodBank(req.session.foodBankId);
      
      if (!foodBank) {
        // Create a default food bank for the user if one doesn't exist
        const user = await storage.getUser(req.session.userId);
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
      const updatedFoodBank = await storage.updateFoodBank(req.session.foodBankId, validatedData);
      
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
      const donors = await storage.getDonorsByFoodBankId(req.session.foodBankId);
      return res.json(donors);
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });
  
  // User Settings Routes
  app.get('/api/my-settings', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const settings = await storage.getUserSettings(req.session.userId);
      
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
      let settings = await storage.getUserSettings(req.session.userId);
      
      if (!settings) {
        // Create new settings
        settings = await storage.createUserSettings({
          ...validatedData,
          userId: req.session.userId
        });
      } else {
        // Update existing settings
        settings = await storage.updateUserSettings(req.session.userId, validatedData);
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
      
      for (let i = 0; i < donorsData.length; i++) {
        try {
          const validatedDonor = csvDonorSchema.parse(donorsData[i]);
          
          // Create impact URL
          const emailHash = crypto
            .createHash('sha256')
            .update(validatedDonor.email)
            .digest('hex')
            .substring(0, 12);
          
          const impactUrl = `${emailHash}`;
          
          processedDonors.push({
            firstName: validatedDonor.first_name,
            lastName: validatedDonor.last_name,
            email: validatedDonor.email,
            totalGiving: validatedDonor.total_giving,
            firstGiftDate: validatedDonor.first_gift_date ? new Date(validatedDonor.first_gift_date) : null,
            lastGiftDate: validatedDonor.last_gift_date ? new Date(validatedDonor.last_gift_date) : null,
            largestGift: validatedDonor.largest_gift || null,
            giftCount: validatedDonor.gift_count || null,
            foodBankId,
            impactUrl
          });
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
      
      if (errors.length > 0 && processedDonors.length === 0) {
        return res.status(400).json({ 
          message: "All donor records contain validation errors", 
          errors 
        });
      }
      
      const createdDonors = await storage.createDonors(processedDonors);
      
      return res.status(201).json({ 
        message: `Successfully processed ${createdDonors.length} donor records`,
        totalProcessed: createdDonors.length,
        hasErrors: errors.length > 0,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to process donor data" });
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
    
    return res.json({ donor, foodBank });
  });

  const httpServer = createServer(app);
  return httpServer;
}
