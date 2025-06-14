# How to Enable Google Authentication in Firebase

Follow these steps to fix the `auth/operation-not-allowed` error and enable Google Authentication for your admin panel.

## Step 1: Access Firebase Console

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (portfolio4me)

## Step 2: Enable Google Authentication

1. In the left sidebar, click on **Authentication**
2. Click on the **Sign-in method** tab
3. Find **Google** in the list of providers and click on it
4. Toggle the **Enable** switch to the ON position
5. Enter a **Project support email** (use your email: hypertextrj@gmail.com)
6. Click **Save**

![Enable Google Auth](https://i.imgur.com/JQXxJZG.png)

## Step 3: Configure OAuth Consent Screen (if needed)

If prompted to configure the OAuth consent screen:

1. Select **External** user type (unless you have a Google Workspace)
2. Fill in the required fields:
   - App name: Portfolio Admin
   - User support email: hypertextrj@gmail.com
   - Developer contact information: hypertextrj@gmail.com
3. Click **Save and Continue**
4. On the Scopes screen, click **Save and Continue**
5. On the Test users screen, click **Save and Continue**
6. Review your settings and click **Back to Dashboard**

## Step 4: Add Authorized Domains

1. In the Firebase Authentication page, scroll down to the **Authorized domains** section
2. Click **Add domain**
3. Add your domain (for local development, `localhost` should already be there)
4. Click **Add**

## Step 5: Test the Authentication

1. Restart your Next.js development server:
   ```
   npm run dev
   ```
2. Navigate to your admin login page: http://localhost:3000/admin/login
3. Try signing in with Google again

## Troubleshooting

If you still encounter issues:

### Check the Firebase Debug Console

Look for any additional error messages in the Firebase Authentication section of the Firebase Console.

### Verify Project Configuration

Make sure your Firebase project configuration in `.env.local` matches the one in your Firebase project settings.

### Check for CORS Issues

If you're testing on a custom domain or non-standard port, make sure it's added to the authorized domains list.

### Enable Debug Mode

Add this code to your `AuthContext.tsx` file to enable more detailed error logging:

```javascript
// Add at the top of the file
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Add after initializing auth
if (process.env.NODE_ENV === 'development') {
  console.log('Using Firebase Auth Emulator');
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

### Common Error Codes

- `auth/operation-not-allowed`: The provider is not enabled in the Firebase Console
- `auth/popup-blocked`: The browser is blocking the popup window
- `auth/popup-closed-by-user`: The user closed the popup window before completing the sign-in
- `auth/unauthorized-domain`: The domain of your app is not authorized 