import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcryptjs
 * @param {string} password - The plaintext password to hash
 * @returns {Promise<string>} - The hashed password
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plaintext password against a hash using bcryptjs
 * @param {string} password - The plaintext password to verify
 * @param {string} hash - The hashed password to compare against
 * @returns {Promise<boolean>} - Whether the password matches the hash
 */
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
