import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { csvDonorSchema, insertFoodBankSchema } from "@shared/schema";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  
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
