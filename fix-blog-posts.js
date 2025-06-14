// Script to update blog posts status to 'published'
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "rj-ekart-firebase",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "rj-ekart-firebase.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateBlogPosts() {
  try {
    console.log('Updating all blog posts to published status...');
    
    // Get all blog posts
    const blogRef = collection(db, 'blog');
    const snapshot = await getDocs(blogRef);
    
    console.log(`Found ${snapshot.size} total blog posts`);
    
    // Update each post to published status
    let updateCount = 0;
    
    for (const docSnap of snapshot.docs) {
      const postId = docSnap.id;
      const postData = docSnap.data();
      
      console.log(`Processing post: ${postId} - ${postData.title} (current status: ${postData.status || 'unknown'})`);
      
      if (postData.status !== 'published') {
        await updateDoc(doc(db, 'blog', postId), {
          status: 'published'
        });
        updateCount++;
        console.log(`Updated status to published for: ${postData.title}`);
      }
    }
    
    console.log(`Updated ${updateCount} posts to published status`);
    console.log('Done!');
    
  } catch (error) {
    console.error('Error updating blog posts:', error);
  }
}

// Run the update function
updateBlogPosts(); 