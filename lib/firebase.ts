// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "rj-ekart-firebase.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Debug Firebase configuration
console.log("Firebase Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log("Firebase Storage Bucket:", firebaseConfig.storageBucket);

// Initialize Firebase (only initialize once)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage with explicit bucket
const storage = getStorage(app);

// Initialize Auth
const auth = getAuth(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Log initialization
console.log("Firebase initialized with project:", app.options.projectId);
console.log("Storage bucket:", app.options.storageBucket);

// Connect to emulators if in development
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  try {
    if (process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST) {
      connectFirestoreEmulator(
        db, 
        process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST.split(':')[0], 
        parseInt(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST.split(':')[1])
      );
      console.log("Connected to Firestore emulator");
    }
    
    if (process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST) {
      connectAuthEmulator(auth, `http://${process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST}`);
      console.log("Connected to Auth emulator");
    }
    
    if (process.env.NEXT_PUBLIC_STORAGE_EMULATOR_HOST) {
      connectStorageEmulator(
        storage, 
        process.env.NEXT_PUBLIC_STORAGE_EMULATOR_HOST.split(':')[0], 
        parseInt(process.env.NEXT_PUBLIC_STORAGE_EMULATOR_HOST.split(':')[1])
      );
      console.log("Connected to Storage emulator");
    }
  } catch (error) {
    console.error("Error connecting to emulators:", error);
  }
}

export { app, db, storage, auth, googleProvider }; 