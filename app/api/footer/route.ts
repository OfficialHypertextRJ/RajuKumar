import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

// GET handler for fetching footer data
export async function GET() {
  try {
    // Get the footer document from Firestore
    const footerDocRef = doc(db, 'content', 'footer');
    const footerDoc = await getDoc(footerDocRef);
    
    // Check if the document exists
    if (!footerDoc.exists()) {
      return NextResponse.json(
        { error: 'Footer data not found' },
        { status: 404 }
      );
    }
    
    // Return the data
    const footerData = footerDoc.data();
    return NextResponse.json(footerData);
  } catch (error) {
    console.error('Error fetching footer data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch footer data' },
      { status: 500 }
    );
  }
}

// POST handler for revalidating footer content
export async function POST(request: Request) {
  try {
    // Revalidate all pages that include the footer
    revalidatePath('/', 'layout');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Footer cache revalidated' 
    });
  } catch (error) {
    console.error('Error revalidating footer:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate footer' },
      { status: 500 }
    );
  }
} 