/**
 * Sequential ID Generator
 * Generates user-friendly sequential IDs like 000001, 000002, etc.
 */

import prisma from '../config/prisma';

/**
 * Generate the next sequential display ID for a user
 * Format: 6-digit zero-padded number (e.g., "000001", "000042", "001234")
 * 
 * @returns Promise<string> The next sequential ID
 */
export async function generateNextDisplayId(): Promise<string> {
  try {
    // Use PostgreSQL sequence to get next ID atomically
    const result = await prisma.$queryRaw<Array<{ nextval: bigint }>>`
      SELECT nextval('user_display_id_seq') as nextval
    `;
    
    const nextId = Number(result[0].nextval);
    
    // Format as 6-digit zero-padded string
    return nextId.toString().padStart(6, '0');
  } catch (error) {
    console.error('Error generating sequential ID:', error);
    throw new Error('Failed to generate display ID');
  }
}

/**
 * Format a display ID for UI presentation
 * Adds prefix or formatting as needed
 * 
 * @param displayId The sequential ID
 * @returns Formatted display ID
 */
export function formatDisplayId(displayId: string): string {
  // Currently just returns the ID as-is
  // Can be extended to add prefixes like "PT-000001" for patients, "ST-000001" for staff
  return displayId;
}

/**
 * Parse and validate a display ID
 * 
 * @param displayId The display ID to validate
 * @returns boolean True if valid
 */
export function isValidDisplayId(displayId: string): boolean {
  // Check if it's a 6-digit number (with leading zeros)
  return /^\d{6}$/.test(displayId);
}
