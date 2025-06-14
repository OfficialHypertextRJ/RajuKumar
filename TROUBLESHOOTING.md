# Firebase Authentication Troubleshooting Guide

This guide helps you resolve common Firebase authentication issues with your Portfolio Admin Panel.

## Common Error: auth/operation-not-allowed

**Error Message:**
```
Google sign-in error: FirebaseError: Firebase: Error (auth/operation-not-allowed).
```

**Solution:**
This error occurs when the Google sign-in method is not enabled in your Firebase project.

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on "Authentication" in the left sidebar
4. Click on the "Sign-in method" tab
5. Find "Google" in the list and click on it
6. Toggle the "Enable" switch to ON
7. Enter your project support email (hypertextrj@gmail.com)
8. Click "Save"

You can also run our helper script:
```
npm run setup:google-auth
```

## Common Error: auth/unauthorized-domain

**Error Message:**
```
Firebase: Error (auth/unauthorized-domain).
```

**Solution:**
This error occurs when the domain you're using is not authorized in Firebase.

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on "Authentication" in the left sidebar
4. Click on the "Sign-in method" tab
5. Scroll down to the "Authorized domains" section
6. Add your domain (e.g., localhost, your-domain.com)
7. Click "Add"

## Common Error: auth/popup-blocked

**Error Message:**
```
Firebase: Error (auth/popup-blocked).
```

**Solution:**
This error occurs when the browser blocks the popup window for authentication.

1. Check your browser settings to allow popups for your site
2. Make sure you're not in incognito/private browsing mode
3. Try a different browser

## Common Error: Missing Environment Variables

**Error Message:**
```
Firebase: No Firebase App '[DEFAULT]' has been created - call Firebase App.initializeApp()
```

**Solution:**
This error occurs when your Firebase configuration is missing or incorrect.

1. Create a `.env.local` file in your project root
2. Add your Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

3. Restart your development server

## Common Error: Warning: Extra attributes from the server

**Error Message:**
```
Warning: Extra attributes from the server: __processed_XXXX__
```

**Solution:**
This is a harmless warning from Next.js related to server/client hydration. It doesn't affect functionality and can be safely ignored.

## Common Error: Access Denied After Authentication

**Error Message:**
```
Access denied. Only authorized administrators can access this area.
```

**Solution:**
This occurs when you've successfully authenticated but your email is not authorized as an admin.

1. Check that you're signing in with the correct email (hypertextrj@gmail.com)
2. Verify the admin email in `lib/adminUtils.ts` matches your Google account
3. Make sure your Google account email is verified

## Debugging Authentication Flow

To get more detailed error information:

1. Open your browser's developer console (F12 or right-click > Inspect > Console)
2. Look for error messages related to Firebase or authentication
3. The AuthContext has DEBUG mode enabled, which will log detailed information

## Still Having Issues?

If you're still experiencing problems:

1. Clear your browser cache and cookies
2. Try using an incognito/private browsing window
3. Check if your Firebase project has any usage restrictions or quotas
4. Verify that your Firebase project's billing status is active if required
5. Check the Firebase Authentication logs in the Firebase Console

For more help, refer to the [Firebase Authentication documentation](https://firebase.google.com/docs/auth). 