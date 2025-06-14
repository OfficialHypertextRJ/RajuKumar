import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { getCachedData } from './dataCache';

// Cache expiration times
const LONG_CACHE_TIME = 60 * 60 * 1000; // 1 hour
const MEDIUM_CACHE_TIME = 15 * 60 * 1000; // 15 minutes
const SHORT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

// Fetch hero section content
export async function fetchHeroContent() {
  return getCachedData('hero-content', async () => {
    try {
      const heroDocRef = doc(db, 'content', 'hero');
      const heroDoc = await getDoc(heroDocRef);
      
      if (heroDoc.exists()) {
        return heroDoc.data();
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching hero content:', error);
      return null;
    }
  }, LONG_CACHE_TIME);
}

// Fetch featured projects (up to 3)
export async function fetchFeaturedProjects() {
  return getCachedData('featured-projects', async () => {
    try {
      // First get the featured project IDs from settings
      const settingsDocRef = doc(db, 'settings', 'homepage');
      const settingsDoc = await getDoc(settingsDocRef);
      
      if (!settingsDoc.exists()) {
        return [];
      }
      
      const { featuredProjects = [] } = settingsDoc.data();
      
      if (featuredProjects.length === 0) {
        // If no featured projects are set, return the 3 most recent projects
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, orderBy('createdAt', 'desc'), limit(3));
        const querySnapshot = await getDocs(q);
        
        const projects: any[] = [];
        querySnapshot.forEach((doc) => {
          projects.push({ id: doc.id, ...doc.data() });
        });
        
        return projects;
      }
      
      // Fetch the featured projects by their IDs
      const projects: any[] = [];
      
      for (const projectId of featuredProjects) {
        const projectDocRef = doc(db, 'projects', projectId);
        const projectDoc = await getDoc(projectDocRef);
        
        if (projectDoc.exists()) {
          projects.push({ id: projectDoc.id, ...projectDoc.data() });
        }
      }
      
      return projects;
    } catch (error) {
      console.error('Error fetching featured projects:', error);
      return [];
    }
  }, MEDIUM_CACHE_TIME);
}

// Fetch latest blog posts (up to 3)
export async function fetchLatestBlogPosts() {
  return getCachedData('latest-blog-posts', async () => {
    try {
      console.log('Fetching latest blog posts...');
      
      const blogRef = collection(db, 'blog');
      const q = query(
        blogRef, 
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      console.log(`Found ${querySnapshot.size} total blog posts`);
      
      // Define post type
      interface BlogPost {
        id: string;
        title: string;
        excerpt?: string;
        coverImage?: string;
        category?: string;
        content?: string;
        publishDate?: any;
        status?: string;
        [key: string]: any; // Allow for other fields
      }
      
      const posts: BlogPost[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        posts.push({
          id: doc.id,
          ...data,
          title: data.title || 'Untitled Post',
          excerpt: data.excerpt || '',
          coverImage: data.coverImage || 'https://placehold.co/600x400/3bcf9a/333333?text=Blog+Post',
          category: data.category || 'Uncategorized',
        });
      });
      
      // Sort by publishDate
      const sortedPosts = posts.sort((a, b) => {
        const dateA = a.publishDate?.seconds || 0;
        const dateB = b.publishDate?.seconds || 0;
        return dateB - dateA;
      });
      
      return sortedPosts.slice(0, 3); // Return up to 3 posts
    } catch (error) {
      console.error('Error fetching latest blog posts:', error);
      return [];
    }
  }, SHORT_CACHE_TIME);
}

// Fetch about page content
export async function fetchAboutContent() {
  return getCachedData('about-content', async () => {
    try {
      const aboutDocRef = doc(db, 'content', 'about');
      const aboutDoc = await getDoc(aboutDocRef);
      
      if (aboutDoc.exists()) {
        return aboutDoc.data();
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching about content:', error);
      return null;
    }
  }, LONG_CACHE_TIME);
}

// Fetch all resource categories
export async function fetchResourceCategories() {
  return getCachedData('resource-categories', async () => {
    try {
      const categoriesRef = collection(db, 'resourceCategories');
      const q = query(categoriesRef, orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const categories: any[] = [];
      querySnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() });
      });
      
      return categories;
    } catch (error) {
      console.error('Error fetching resource categories:', error);
      return [];
    }
  }, MEDIUM_CACHE_TIME);
}

// Fetch footer content
export async function fetchFooterContent() {
  return getCachedData('footer-content', async () => {
    try {
      const footerDocRef = doc(db, 'content', 'footer');
      const footerDoc = await getDoc(footerDocRef);
      
      if (footerDoc.exists()) {
        const data = footerDoc.data();
        return {
          copyright: data.copyright,
          email: data.email,
          phone: data.phone,
          location: data.location,
          socialLinks: data.socialLinks,
          _timestamp: Date.now() // Add a timestamp to force React to detect changes
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching footer content:', error);
      return null;
    }
  }, SHORT_CACHE_TIME);
}

// Fetch all projects
export async function fetchAllProjects() {
  return getCachedData('all-projects', async () => {
    try {
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const projects: any[] = [];
      querySnapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
      });
      
      return projects;
    } catch (error) {
      console.error('Error fetching all projects:', error);
      return [];
    }
  }, MEDIUM_CACHE_TIME);
} 