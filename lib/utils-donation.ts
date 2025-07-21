import { addMonths, isAfter } from 'date-fns';

/**
 * Calculate when a user will be available to donate again
 * @param lastDonationDate - The date of the last donation
 * @param cooldownMonths - Number of months to wait (default: 3)
 * @returns Date when user can donate again
 */
export function calculateAvailableFrom(
  lastDonationDate: Date,
  cooldownMonths: number = 3
): Date {
  return addMonths(lastDonationDate, cooldownMonths);
}

/**
 * Check if a user is currently available to donate
 * @param availableFrom - Date when user becomes available
 * @returns true if user can donate now
 */
export function isUserAvailable(availableFrom: Date | null): boolean {
  if (!availableFrom) return true;
  return isAfter(new Date(), availableFrom);
}

/**
 * Format phone number for display
 * @param phoneNumber - Raw phone number
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format as +1 (XXX) XXX-XXXX for US numbers, adjust as needed
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phoneNumber; // Return original if can't format
}

/**
 * Generate a user-friendly display name for blood group
 * @param bloodGroup - Blood group enum value
 * @returns Display string like "A+" or "O-"
 */
export function formatBloodGroup(bloodGroup: string): string {
  return bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-');
}

/**
 * Calculate days until user can donate again
 * @param availableFrom - Date when user becomes available
 * @returns Number of days, or 0 if available now
 */
export function daysUntilAvailable(availableFrom: Date | null): number {
  if (!availableFrom) return 0;
  
  const now = new Date();
  if (isAfter(now, availableFrom)) return 0;
  
  const diffTime = availableFrom.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a user is currently available to donate based on new schema
 * @param lastDonationDate - Date of last donation
 * @param isDonationPaused - Whether user is in cooldown
 * @returns true if user can donate now
 */
export function isUserAvailableNew(lastDonationDate: Date | null, isDonationPaused: boolean): boolean {
  if (!isDonationPaused) return true;
  
  if (!lastDonationDate) return true;
  
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days
  
  return lastDonationDate <= threeMonthsAgo;
}

/**
 * Calculate days until user can donate again based on new schema
 * @param lastDonationDate - Date of last donation
 * @param isDonationPaused - Whether user is in cooldown
 * @returns Number of days, or 0 if available now
 */
export function daysUntilAvailableNew(lastDonationDate: Date | null, isDonationPaused: boolean): number {
  if (!isDonationPaused || !lastDonationDate) return 0;
  
  const now = new Date();
  const availableDate = new Date(lastDonationDate.getTime() + 90 * 24 * 60 * 60 * 1000); // Add 90 days
  
  if (availableDate <= now) return 0;
  
  const diffTime = availableDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
