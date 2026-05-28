/**
 * crypto-utils.js - Password hashing utility
 * Uses a simple client-side hashing approach for demo
 * Note: For production, use proper password hashing on server
 */

const CryptoUtils = {
  // Simple hash function for demonstration
  // In production, use bcryptjs or similar library with server-side validation
  async hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Verify password against hash (simple comparison for demo)
  async verifyPassword(password, hash) {
    const newHash = await this.hashPassword(password);
    return newHash === hash;
  },

  // Generate a simple salt for additional security
  generateSalt() {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  },

  // Hash password with salt
  async hashPasswordWithSalt(password, salt = null) {
    if (!salt) salt = this.generateSalt();
    const combined = password + salt;
    const hash = await this.hashPassword(combined);
    return { hash, salt };
  },

  // Verify password with salt
  async verifyPasswordWithSalt(password, hash, salt) {
    const combined = password + salt;
    const newHash = await this.hashPassword(combined);
    return newHash === hash;
  }
};

// Expose globally
window.CryptoUtils = CryptoUtils;
