'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import NavigationMenu from '@/components/NavigationMenu';
import Footer from '@/components/Footer';
import ConnectWithMe from '@/components/ConnectWithMe';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import Image from 'next/image';
import { getCachedData } from '@/lib/dataCache';
import { getOptimizedImageUrl, getBlurDataUrl } from '@/lib/imageOptimization';

interface BlogPost {
  id: string;
  title: string;
  publishDate: any;
  category: string;
  coverImage: string;
  excerpt: string;
  status: string;
}

// Memoized blog post component for better performance
const BlogPostCard = memo(({ post, formatDate }: { post: BlogPost, formatDate: (timestamp: any) => string }) => {
  const optimizedImageUrl = getOptimizedImageUrl(post.coverImage, 600);
  
  return (
    <Link key={post.id} href={`/blog/${post.id}`}>
      <div className="group bg-transparent rounded-lg overflow-hidden transition-transform hover:-translate-y-1 flex flex-col md:flex-row gap-6">
        {/* Image - Left Side */}
        <div className="relative h-[200px] md:h-64 md:w-64 lg:w-[700px] overflow-hidden rounded-lg bg-[#0d0d0d]">
          {post.coverImage ? (
            <Image 
              src={optimizedImageUrl}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              className="transition-transform group-hover:scale-105"
              placeholder="blur"
              blurDataURL={getBlurDataUrl()}
              loading="lazy"
              onError={(e) => {
                // If image fails to load, replace with placeholder
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = 'https://placehold.co/600x400/3bcf9a/333333?text=Blog+Post';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0d0d0d]">
              <span className="text-[#3bcf9a]">No Image</span>
            </div>
          )}
        </div>
        
        {/* Content - Right Side */}
        <div className="flex flex-col justify-center flex-grow">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-[#3bcf9a] transition-colors line-clamp-2">
            {post.title}
          </h2>
          
          <p className="text-[#8a8a8a] mb-5">
            {formatDate(post.publishDate)}
          </p>
          
          <div className="inline-block bg-[rgba(59,207,154,0.2)] text-[#3bcf9a] text-sm font-semibold px-3 py-1 rounded mb-0 w-fit">
            {post.category}
          </div>
        </div>
      </div>
    </Link>
  );
});

BlogPostCard.displayName = 'BlogPostCard';

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Make content visible with a short delay on mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Format date from Firebase Timestamp - memoized for performance
  const formatDate = useCallback((timestamp: any): string => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.seconds 
        ? new Date(timestamp.seconds * 1000) 
        : new Date(timestamp);
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  }, []);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        
        // Use cached data if available
        const posts = await getCachedData('blog-posts-page', async () => {
          const blogRef = collection(db, 'blog');
          const q = query(
            blogRef, 
            orderBy('createdAt', 'desc')
          );
          
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.size > 0) {
            const fetchedPosts = querySnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                title: data.title || 'Untitled Post',
                publishDate: data.publishDate || new Date(),
                category: data.category || 'Uncategorized',
                coverImage: data.coverImage || 'https://placehold.co/600x400/3bcf9a/333333?text=Blog+Post',
                excerpt: data.excerpt || 'No description available',
                status: data.status || 'draft'
              };
            });
            
            // Sort by date (newest first)
            return fetchedPosts.sort((a, b) => {
              const dateA = a.publishDate?.seconds || 0;
              const dateB = b.publishDate?.seconds || 0;
              return dateB - dateA;
            });
          }
          
          return [];
        }, 5 * 60 * 1000); // Cache for 5 minutes
        
        setBlogPosts(posts);
        
        if (posts.length === 0) {
          setError('No blog posts found');
        } else {
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts');
        setBlogPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
    
    // Set up storage event listener for updates
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'blog_updated') {
        fetchBlogPosts();
      }
    };
    
    window.addEventListener('storage', handleStorageEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#041B15]">
      <Navbar />
      <NavigationMenu />
      <div className="h-[70px] sm:h-0" aria-hidden="true"></div>
      
      <main className={`flex-1 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 font-archivo text-center">
            Writing about design and tech...
          </h1>
          
          {loading ? (
            <div className="flex justify-center items-center py-32">
              <LoadingSpinner />
            </div>
          ) : error && blogPosts.length === 0 ? (
            <div className="bg-[#0d0d0d] rounded-lg p-8 text-center">
              <p className="text-gray-400 text-lg">{error}</p>
            </div>
          ) : (
            <div className="space-y-10">
              {blogPosts.map((post) => (
                <BlogPostCard 
                  key={post.id} 
                  post={post} 
                  formatDate={formatDate} 
                />
              ))}
              
              {blogPosts.length === 0 && !error && (
                <div className="bg-[#0d0d0d] rounded-lg p-8 text-center">
                  <p className="text-gray-400 text-lg">No blog posts found</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Add ConnectWithMe section */}
        <div className="py-16">
          <ConnectWithMe />
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 