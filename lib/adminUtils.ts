import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Get admin email from environment variable or use default
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'hypertextrj@gmail.com';

/**
 * Check if a user is an admin based on their email
 */
export async function isUserAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;
  
  try {
    // Get the latest ID token to ensure fresh claims
    await user.getIdToken(true);
    
    // Check if user's email matches the admin email
    if (user.email === ADMIN_EMAIL) {
      // Create or update admin user record in Firestore
      try {
        const adminRef = doc(db, 'adminUsers', user.uid);
        const adminSnap = await getDoc(adminRef);
        
        if (!adminSnap.exists()) {
          await setDoc(adminRef, {
            email: user.email,
            displayName: user.displayName || 'Admin User',
            photoURL: user.photoURL || '',
            lastLogin: serverTimestamp(),
            createdAt: serverTimestamp(),
            isAdmin: true
          });
        } else {
          await updateDoc(adminRef, {
            lastLogin: serverTimestamp(),
            isAdmin: true
          });
        }
      } catch (error) {
        console.error('Error updating admin user record:', error);
        // Even if the record update fails, the user is still an admin
      }
      
      return true;
    }
  } catch (error) {
    console.error('Error verifying admin status:', error);
    return false;
  }
  
  return false;
}

/**
 * Get admin user information from Firestore
 */
export async function getAdminUserInfo(userId: string) {
  try {
    const adminRef = doc(db, 'adminUsers', userId);
    const adminSnap = await getDoc(adminRef);
    
    if (adminSnap.exists()) {
      return adminSnap.data();
    }
    
    return null;
  } catch (error) {
    console.error('Error getting admin user info:', error);
    return null;
  }
}

/**
 * Log admin activity for audit purposes
 */
export async function logAdminActivity(userId: string, action: string, details: any) {
  try {
    const activityRef = doc(db, 'adminActivity', new Date().toISOString() + '_' + userId);
    await setDoc(activityRef, {
      userId,
      action,
      details,
      timestamp: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error logging admin activity:', error);
    return false;
  }
} 