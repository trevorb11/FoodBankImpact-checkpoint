import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { IMPACT_FORMULAS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates impact metrics based on donation amount
 * @param amount Donation amount in dollars
 * @returns Object with calculated impact metrics
 */
export function calculateImpactMetrics(amount: number) {
  const meals = amount * IMPACT_FORMULAS.DOLLARS_TO_MEALS;
  const people = Math.ceil(meals / IMPACT_FORMULAS.MEALS_TO_PEOPLE);
  const pounds = meals * (1 / IMPACT_FORMULAS.POUNDS_TO_MEALS);
  const co2Saved = pounds * IMPACT_FORMULAS.CO2_PER_POUND;
  const waterSaved = pounds * IMPACT_FORMULAS.WATER_PER_POUND;
  
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
