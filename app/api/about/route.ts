import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

// GET handler for fetching about data
export async function GET() {
  try {
    // Get the about document from Firestore
    const aboutDocRef = doc(db, 'content', 'about');
    const aboutDoc = await getDoc(aboutDocRef);
    
    // Check if the document exists
    if (!aboutDoc.exists()) {
      return NextResponse.json(
        { error: 'About data not found' },
        { status: 404 }
      );
    }
    
    // Return the data
    const aboutData = aboutDoc.data();
    return NextResponse.json(aboutData);
  } catch (error) {
    console.error('Error fetching about data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about data' },
      { status: 500 }
    );
  }
}

// POST handler for updating about data and revalidating paths
export async function POST(request: Request) {
  try {
    // Revalidate the about page and homepage
    revalidatePath('/about');
    revalidatePath('/');
    
    return NextResponse.json({ 
      success: true, 
      message: 'About section cache revalidated' 
    });
  } catch (error) {
    console.error('Error revalidating about section:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate about section' },
      { status: 500 }
    );
  }
} 