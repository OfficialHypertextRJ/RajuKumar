'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchLatestBlogPosts } from '@/lib/fetchContent';

interface BlogPost {
  id: string;
  title: string;
  publishDate: any;
  category: string;
  coverImage?: string;
  excerpt?: string;
  content?: string;
  status?: string;
}

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlogPosts = async () => {
      setLoading(true);
      
      try {
        const fetchedPosts = await fetchLatestBlogPosts();
        
        if (fetchedPosts && fetchedPosts.length > 0) {
          // Map posts to match our interface
          const mappedPosts: BlogPost[] = fetchedPosts.map(post => ({
            id: post.id,
            title: post.title,
            publishDate: post.publishDate,
            category: post.category || 'Uncategorized',
            coverImage: post.coverImage,
            excerpt: post.excerpt,
            content: post.content,
            status: post.status
          }));
          
          setBlogPosts(mappedPosts);
        } else {
          setBlogPosts([]);
        }
      } catch (error) {
        console.error('Error loading blog posts:', error);
        setBlogPosts([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadBlogPosts();
    
    // Set up refresh when storage event is triggered
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'blog_updated') {
        loadBlogPosts();
      }
    };
    
    window.addEventListener('storage', handleStorageEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  // Format date from Firebase Timestamp
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return '';
    
    const date = timestamp.seconds 
      ? new Date(timestamp.seconds * 1000) 
      : new Date(timestamp);
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Don't render until content is loaded
  if (loading) {
    return null;
  }

  // If no blog posts found, don't render the section
  if (blogPosts.length === 0) {
    return null;
  }

  return (
    <section id="blog" className="section bg-[#0d0d0d] py-16 m-4">
      <div className="px-4 max-w-6xl mx-auto">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-stretch md:gap-0 md:min-h-[300px]">
          {/* Left side - Latest from the blog */}
          <div className="md:w-1/3 md:pr-0 md:flex md:flex-col md:justify-center md:items-end">
            <div className="md:text-right">
              <h2 className="text-3xl font-bold text-white leading-tight font-archivo">
                <span className="md:hidden">Latest from the blog</span>
                <span className="hidden md:inline">
                  Latest<br/>
                  from the<br/>
                  blog
                </span>
              </h2>
              <div className="mt-6">
                <Link 
                  href="/blog" 
                  className="inline-flex items-center text-[#3bcf9a] font-semibold group mt-4"
                >
                  View all posts
                  <svg className="ml-2 group-hover:ml-3 transition-all w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Vertical divider */}
          <div className="hidden md:block w-[2px] bg-white mx-4 self-stretch min-h-[250px]"></div>
          
          {/* Right side - Blog posts in column */}
          <div className="md:w-2/3 md:pl-4 md:flex md:flex-col md:justify-center">
            <div className="space-y-6">
              {blogPosts.map((post) => (
                <div key={post.id} className="border-b border-white/10 pb-6 last:border-0">
                  <div className="flex items-center gap-2 text-[#8a8a8a] text-sm mb-2">
                    <span className="text-[#3bcf9a]">{post.category}</span>
                    <span>•</span>
                    <span>{formatDate(post.publishDate)}</span>
                  </div>
                  
                  <h3 className="text-white text-xl font-semibold mb-2 hover:text-[#3bcf9a] transition-colors">
                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                  </h3>
                  
                  {post.excerpt && (
                    <p className="text-[#8a8a8a] text-sm mb-2">
                      {post.excerpt.length > 120 ? `${post.excerpt.substring(0, 120)}...` : post.excerpt}
                    </p>
                  )}
                  
                  <Link 
                    href={`/blog/${post.id}`}
                    className="inline-flex items-center text-[#3bcf9a] text-sm font-medium group"
                  >
                    Read Article
                    <svg className="ml-1 group-hover:ml-2 transition-all w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blog; 