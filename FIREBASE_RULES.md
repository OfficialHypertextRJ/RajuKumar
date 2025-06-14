# Firebase Security Rules

This document explains the security rules implemented for the Portfolio Admin Panel.

## Overview

The security rules are designed to:
1. Allow public read access to all portfolio content
2. Restrict write access to only the admin user (hypertextrj@gmail.com)
3. Protect sensitive admin data and operations

## Firestore Rules

The Firestore rules (`firestore.rules`) implement the following security model:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Function to check if the user is the admin with specific email
    function isAdmin() {
      return request.auth != null && request.auth.token.email == "hypertextrj@gmail.com";
    }

    // Allow read access to all documents for anyone (public data)
    match /{document=**} {
      allow read;
    }

    // All collections - only admin can write
    match /{collection}/{document=**} {
      allow write: if isAdmin();
    }
  }
}
```

### Key Points:

- **Public Read Access**: Anyone can read the portfolio content
- **Admin-Only Write Access**: Only hypertextrj@gmail.com can create, update, or delete documents
- **Authentication Required**: All write operations require authentication
- **Email Verification**: The admin email is hardcoded for maximum security

## Storage Rules

The Storage rules (`storage.rules`) implement similar security:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Function to check if the user is the admin with specific email
    function isAdmin() {
      return request.auth != null && request.auth.token.email == "hypertextrj@gmail.com";
    }

    // Allow read access to all files for anyone (public files)
    match /{allPaths=**} {
      allow read;
    }

    // All files - only admin can write
    match /{allPaths=**} {
      allow write: if isAdmin();
    }
  }
}
```

### Key Points:

- **Public Read Access**: Anyone can view and download files
- **Admin-Only Uploads**: Only hypertextrj@gmail.com can upload or delete files
- **Structured Storage**: Different content types are stored in separate folders

## Deployment

To deploy these rules to Firebase:

1. Install the Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```
   firebase login
   ```

3. Select your project:
   ```
   firebase use portfolio4me
   ```

4. Deploy the rules:
   ```
   firebase deploy --only firestore:rules,storage
   ```

Alternatively, use the provided script:
```
node deploy-firebase-rules.js
```

## Testing Rules

To test these rules locally:

1. Start the Firebase emulators:
   ```
   firebase emulators:start
   ```

2. Visit the emulator UI (usually at http://localhost:4000)

3. Test read/write operations with different authentication states

## Security Best Practices

1. **Never** hardcode API keys or secrets in client-side code
2. Keep the admin email private and secure
3. Regularly review and update security rules
4. Enable Firebase Authentication logs and alerts
5. Set up Firebase Security Rules unit tests for critical operations 