import { ObjectId } from 'mongodb';

/**
 * Generate a unique ID string from MongoDB ObjectId
 *
 * This creates a 24-character hexadecimal string that:
 * - Is globally unique
 * - Contains an embedded timestamp
 * - Is URL-safe and case-insensitive
 *
 * Use this for all new document IDs instead of relying on MongoDB's _id field.
 */
export function generateId(): string {
  return new ObjectId().toHexString();
}
