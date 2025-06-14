/**
 * Firebase Authentication Configuration
 * 
 * This file contains settings for Firebase Authentication.
 * It should be uploaded to Firebase using the Firebase CLI.
 */

module.exports = {
  // Configure email provider settings
  providers: {
    // Google provider configuration
    google: {
      enabled: true,
      // Allowlist specific domains (optional)
      allowDomains: ['gmail.com'],
    },
    
    // Disable email/password authentication
    email: {
      enabled: false,
    },
  },
  
  // Email verification settings
  emailVerification: {
    // Require email verification before allowing access
    enabled: true,
  },
  
  // User management settings
  userManagement: {
    // Allow users to create accounts
    createEnabled: false,
    // Allow users to delete their accounts
    deleteEnabled: false,
  },
  
  // Session settings
  sessionCookie: {
    // Session cookie expiration in milliseconds (default: 2 weeks)
    expiresIn: 1209600000, // 2 weeks
  },
  
  // Admin access control
  accessControl: {
    // List of admin emails
    adminEmails: ['hypertextrj@gmail.com'],
  },
}; 