import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { IMPACT_FORMULAS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates impact metrics based on donation amount using food bank specific metrics if available
 * @param amount Donation amount in dollars
 * @param foodBank Optional food bank with custom impact factors
 * @returns Object with calculated impact metrics
 */
export function calculateImpactMetrics(
  amount: number, 
  foodBank?: { 
    dollarsPerMeal?: number; 
    mealsPerPerson?: number; 
    poundsPerMeal?: number; 
    co2PerPound?: number; 
    waterPerPound?: number; 
  }
) {
  // Use food bank specific values if provided, otherwise fall back to defaults
  const dollarsPerMeal = foodBank?.dollarsPerMeal !== undefined ? 
    Number(foodBank.dollarsPerMeal) : 
    (1 / IMPACT_FORMULAS.DOLLARS_TO_MEALS);
  
  const mealsPerPerson = foodBank?.mealsPerPerson !== undefined ? 
    Number(foodBank.mealsPerPerson) : 
    IMPACT_FORMULAS.MEALS_TO_PEOPLE;
  
  const poundsPerMeal = foodBank?.poundsPerMeal !== undefined ? 
    Number(foodBank.poundsPerMeal) : 
    IMPACT_FORMULAS.POUNDS_TO_MEALS;
  
  const co2PerPound = foodBank?.co2PerPound !== undefined ? 
    Number(foodBank.co2PerPound) : 
    IMPACT_FORMULAS.CO2_PER_POUND;
  
  const waterPerPound = foodBank?.waterPerPound !== undefined ? 
    Number(foodBank.waterPerPound) : 
    IMPACT_FORMULAS.WATER_PER_POUND;
  
  // Calculate impact metrics
  const meals = amount / dollarsPerMeal;
  const people = Math.ceil(meals / mealsPerPerson);
  const pounds = meals * poundsPerMeal;
  const co2Saved = pounds * co2PerPound;
  const waterSaved = pounds * waterPerPound;
  
  return {
    meals: Math.round(meals),
    people,
    pounds: Math.round(pounds),
    co2Saved: Math.round(co2Saved),
    waterSaved: Math.round(waterSaved)
  };
}

/**
 * Formats a date to a readable string
 * @param dateString Date string or Date object
 * @returns Formatted date string
 */
export function formatDate(dateString: string | Date | null): string {
  if (!dateString) return 'N/A';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Generates a unique hash for donor impact URLs
 * @param email Donor email
 * @returns Hashed string
 */
export function generateImpactUrlHash(email: string): string {
  // Simple implementation for demo purposes
  // In production, use a proper hashing algorithm and salt
  return btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
}

/**
 * Copies text to clipboard
 * @param text Text to copy
 * @returns Promise that resolves when text is copied
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return Promise.resolve();
  } catch (error) {
    console.error('Failed to copy text: ', error);
    return Promise.reject(error);
  }
}
