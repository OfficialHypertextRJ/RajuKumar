# Portfolio Admin Panel Setup

This document provides instructions for setting up the admin panel for your portfolio website.

## Firebase Setup

1. **Create a Firebase Project**:
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project" and follow the setup wizard
   - Enable Google Analytics if desired

2. **Set up Firebase Authentication**:
   - In the Firebase Console, go to "Authentication"
   - Enable Google authentication method:
     - Click on the "Google" provider
     - Enable it and configure the OAuth consent screen
     - Add your authorized domains
   - **IMPORTANT**: Only the email `hypertextrj@gmail.com` will have admin access to the panel

3. **Create a Firestore Database**:
   - Go to "Firestore Database" in the Firebase Console
   - Click "Create Database"
   - Start in production mode
   - Choose a location close to your target audience

4. **Set up Firebase Storage**:
   - Go to "Storage" in the Firebase Console
   - Click "Get Started"
   - Follow the setup wizard
   - Set up rules to allow authenticated users to read/write

5. **Get Firebase Configuration**:
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps" and click the web app icon (</>) if you haven't added a web app yet
   - Register your app with a nickname
   - Copy the Firebase configuration object

6. **Create Environment Variables**:
   - Create a `.env.local` file in the root of your project
   - Add the following variables with your Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Google Authentication Setup

1. **Configure Google Cloud Project**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project (the same one linked to Firebase)
   - Navigate to "APIs & Services" > "Credentials"
   - Configure the OAuth consent screen:
     - Set the app name, user support email, and developer contact information
     - Add the necessary scopes (typically email and profile)

2. **Create OAuth Client ID**:
   - In the Credentials tab, click "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Add authorized JavaScript origins:
     - For development: `http://localhost:3000`
     - For production: Your domain URL
   - Add authorized redirect URIs:
     - For development: `http://localhost:3000`
     - For production: Your domain URL
   - Click "Create" and note your Client ID and Client Secret

3. **Add Authorized Domains in Firebase**:
   - Go back to Firebase Console > Authentication > Sign-in method
   - Under "Authorized domains", add your production domain

## Admin Access Configuration

The admin panel is configured to only allow access to the email address `hypertextrj@gmail.com`. This is hardcoded in the `lib/adminUtils.ts` file. When logging in:

1. You must use this exact email address with Google authentication
2. Any other email address will be denied access, even if they can authenticate
3. The system will automatically redirect non-admin users back to the login page

If you need to change the admin email or add additional admins:

1. Open `lib/adminUtils.ts`
2. Modify the `ADMIN_EMAIL` constant to your preferred email address
3. Or, implement a more flexible solution using Firestore to store admin emails

## Firestore Database Structure

The admin panel expects the following collections and documents in your Firestore database:

1. **sections**: Contains documents for different sections of your portfolio
   - hero: Hero section content
   - about: About page content
   - footer: Footer content

2. **projects**: Collection of your portfolio projects
   - Each document represents a project

3. **blog**: Collection of blog posts
   - Each document represents a blog post

4. **resources**: Collection of resources
   - Each document represents a resource category

## Accessing the Admin Panel

1. Start your development server: `npm run dev`
2. Navigate to `/admin/login` in your browser
3. Click "Sign in with Google" and use the `hypertextrj@gmail.com` account
4. You'll be redirected to the admin dashboard at `/admin/dashboard`

## Security Rules

Make sure to set up appropriate security rules in Firebase to protect your data:

### Firestore Rules Example:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all documents for anyone
    match /{document=**} {
      allow read;
    }
    
    // Only allow write access to the specific admin email
    match /{collection}/{document=**} {
      allow write: if request.auth != null && request.auth.token.email == "hypertextrj@gmail.com";
    }
  }
}
```

### Storage Rules Example:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to all files for anyone
    match /{allPaths=**} {
      allow read;
    }
    
    // Only allow write access to the specific admin email
    match /{allPaths=**} {
      allow write: if request.auth != null && request.auth.token.email == "hypertextrj@gmail.com";
    }
  }
}
``` 