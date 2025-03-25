// Standard Feeding America conversion factors
export const IMPACT_FORMULAS = {
  DOLLARS_TO_MEALS: 10, // $1 = 10 meals (Feeding America standard)
  MEALS_TO_PEOPLE: 12,  // Average 12 meals to help 1 person for a month
  POUNDS_TO_MEALS: 1.2, // 1.2 pounds = 1 meal
  CO2_PER_POUND: 2.5,   // 2.5 lbs of CO2 saved per pound of food rescued
  WATER_PER_POUND: 108, // 108 gallons of water saved per pound of food rescued
};

// Validation schemas for CSV columns
export const REQUIRED_CSV_COLUMNS = [
  'first_name',
  'last_name',
  'email',
  'total_giving'
];

export const OPTIONAL_CSV_COLUMNS = [
  'first_gift_date',
  'last_gift_date',
  'largest_gift',
  'gift_count'
];

// Steps in the admin process
export const ADMIN_STEPS = [
  'upload',
  'configure',
  'distribute',
  'preview'
];

// Slides in the donor impact experience
export const IMPACT_SLIDES = [
  'welcome',
  'meals',
  'people',
  'history',
  'thanks',
  'summary'
];
