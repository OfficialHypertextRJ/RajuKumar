'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import NavigationMenu from '@/components/NavigationMenu';
import Footer from '@/components/Footer';
import ConnectWithMe from '@/components/ConnectWithMe';
import LoadingSpinner from '@/components/LoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Close } from '@mui/icons-material';

interface BlogPost {
  id: string;
  title: string;
  publishDate: any;
  category: string;
  coverImage: string;
  content: string;
  status?: string;
}

interface BlogPosts {
  [key: string]: BlogPost;
}

// Static demo blog posts
const demoBlogPosts: BlogPosts = {
  "first-post": {
    id: "first-post",
    title: "My First Blog Post",
    publishDate: { seconds: Date.now() / 1000 - 2 * 24 * 60 * 60 },
    category: "Web Development",
    coverImage: "https://placehold.co/600x400/3bcf9a/333333?text=Web+Development",
    content: `
      <h2>Welcome to My Blog!</h2>
      <p>This is my first blog post created using the admin panel. I'm excited to share my journey in web development with you all.</p>
      
      <h3>What to Expect</h3>
      <p>In this blog, I'll be covering various topics related to web development, including:</p>
      <ul>
        <li>HTML, CSS, and JavaScript fundamentals</li>
        <li>React and Next.js frameworks</li>
        <li>Backend development with Node.js</li>
        <li>Database design and implementation</li>
        <li>Deployment strategies and best practices</li>
      </ul>
      
      <h3>My Background</h3>
      <p>I've been learning web development for the past year, starting with the basics of HTML and CSS. I've gradually built up my skills and am now comfortable working with modern JavaScript frameworks.</p>
      
      <h3>Stay Tuned!</h3>
      <p>I hope you'll join me on this journey of learning and exploration. I'll be posting regular updates, tutorials, and insights from my experiences in the field.</p>
    `,
    status: "published"
  },
  "learning-nextjs": {
    id: "learning-nextjs",
    title: "Learning Next.js",
    publishDate: { seconds: Date.now() / 1000 - 5 * 24 * 60 * 60 },
    category: "React",
    coverImage: "https://placehold.co/600x400/3bcf9a/333333?text=Next.js",
    content: `
      <h2>Getting Started with Next.js</h2>
      <p>Next.js is a powerful React framework that makes building web applications faster and easier. It provides a great developer experience with features like server-side rendering, static site generation, and simplified routing.</p>
      
      <h3>Why Next.js?</h3>
      <p>There are several reasons why Next.js has become one of the most popular frameworks for React development:</p>
      <ul>
        <li>Server-side rendering for improved performance and SEO</li>
        <li>Static site generation for blazing fast page loads</li>
        <li>Built-in API routes for creating backend functionality</li>
        <li>Simplified routing based on the file system</li>
        <li>Automatic code splitting for faster page loading</li>
      </ul>
      
      <h3>Setting Up a Next.js Project</h3>
      <p>Getting started with Next.js is incredibly simple. You can create a new project using:</p>
      <pre><code>npx create-next-app@latest my-next-app</code></pre>
      
      <h3>Conclusion</h3>
      <p>Next.js is an excellent choice for building modern web applications. It combines the power of React with additional features that make development faster and more efficient. In future posts, I'll explore more advanced aspects of Next.js development.</p>
    `,
    status: "published"
  },
  "mastering-tailwind": {
    id: "mastering-tailwind",
    title: "Mastering Tailwind CSS",
    publishDate: { seconds: Date.now() / 1000 - 10 * 24 * 60 * 60 },
    category: "CSS",
    coverImage: "https://placehold.co/600x400/3bcf9a/333333?text=Tailwind",
    content: `
      <h2>The Power of Utility-First CSS</h2>
      <p>Tailwind CSS is a utility-first CSS framework that allows for rapid UI development without leaving your HTML. It provides a comprehensive set of utility classes that you can use directly in your markup.</p>
      
      <h3>Why Utility-First?</h3>
      <p>Traditional CSS frameworks provide pre-designed components, which can be limiting when you want to create a unique design. Tailwind, on the other hand, gives you the building blocks to create your own components exactly the way you want them.</p>
      
      <h3>Key Benefits of Tailwind CSS</h3>
      <ul>
        <li>No more naming CSS classes</li>
        <li>Consistent design system</li>
        <li>Highly customizable</li>
        <li>Smaller file sizes in production</li>
        <li>Great developer experience</li>
      </ul>
      
      <h3>Getting Started with Tailwind</h3>
      <p>You can add Tailwind CSS to your project with npm:</p>
      <pre><code>npm install -D tailwindcss
npx tailwindcss init</code></pre>
      
      <h3>Conclusion</h3>
      <p>Tailwind CSS is a game-changer for front-end development. Its utility-first approach allows for rapid development without sacrificing design flexibility. Give it a try in your next project!</p>
    `,
    status: "published"
  }
};

export default function BlogPostPage() {
  const params = useParams();
  const postId = params?.id as string;
  
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    // Make content visible with a short delay on mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!postId) {
        setError('Invalid blog post ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const docRef = doc(db, 'blog', postId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          setBlogPost({
            id: docSnap.id,
            title: data.title || 'Untitled Post',
            content: data.content || '<p>No content available</p>',
            publishDate: data.publishDate || new Date(),
            category: data.category || 'Uncategorized',
            coverImage: data.coverImage || 'https://placehold.co/600x400/3bcf9a/333333?text=Blog+Post',
            status: data.status
          });
          
          setError(null);
        } else {
          setError('Blog post not found');
          setBlogPost(null);
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post');
        setBlogPost(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogPost();
  }, [postId]);

  // Format date from Firebase Timestamp
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'No date';
    
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
  };

  // Add click event listeners to all images in the blog content after render
  useEffect(() => {
    if (blogPost) {
      setTimeout(() => {
        const contentImages = document.querySelectorAll('.prose img');
        contentImages.forEach(img => {
          img.classList.add('cursor-pointer', 'hover:opacity-90', 'transition-opacity');
          img.addEventListener('click', () => {
            setLightboxImage((img as HTMLImageElement).src);
          });
        });
      }, 500); // Small delay to ensure content is rendered
    }
  }, [blogPost]);

  return (
    <div className="min-h-screen flex flex-col bg-[#041B15]">
      <Navbar />
      <NavigationMenu />
      <div className="h-[70px] sm:h-0" aria-hidden="true"></div>
      
      <main className={`flex-1 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Lightbox for image preview */}
        {lightboxImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <button 
              className="absolute top-4 right-4 text-white bg-[#3bcf9a] rounded-full p-1 hover:bg-[#2aa77a] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxImage(null);
              }}
            >
              <Close />
            </button>
            <div className="max-w-screen-lg max-h-screen">
              <img 
                src={lightboxImage} 
                alt="Enlarged view" 
                className="max-w-full max-h-[90vh] object-contain"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-40">
            <LoadingSpinner />
          </div>
        ) : error && !blogPost ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
            <h1 className="text-3xl font-bold text-red-500 mb-4">{error}</h1>
            <Link 
              href="/blog" 
              className="inline-flex items-center text-[#3bcf9a] font-medium"
            >
              <ArrowLeft className="mr-1" fontSize="small" />
              Back to Blog
            </Link>
          </div>
        ) : blogPost && (
          <>
            <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
              <div className="mb-10">
                <Link 
                  href="/blog" 
                  className="inline-flex items-center text-[#3bcf9a] font-medium hover:underline"
                >
                  <ArrowLeft className="mr-1" fontSize="small" />
                  Back to Blog
                </Link>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-archivo font-bold text-white mb-6">
                {blogPost.title}
              </h1>
              
              <p className="text-[#8a8a8a] mb-5">
                {formatDate(blogPost.publishDate)}
              </p>
              
              <div className="inline-block bg-[rgba(59,207,154,0.2)] text-[#3bcf9a] text-sm font-semibold px-3 py-1 rounded mb-8 w-fit">
                {blogPost.category}
              </div>
              
              {blogPost.coverImage && (
                <div className="relative w-full h-[300px] md:h-[500px] rounded-lg overflow-hidden mb-10 bg-[#0d0d0d]">
                  <Image 
                    src={blogPost.coverImage} 
                    alt={blogPost.title} 
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-lg"
                    priority
                    onError={(e) => {
                      // If image fails to load, replace with placeholder
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Prevent infinite loop
                      target.src = 'https://placehold.co/800x500/3bcf9a/333333?text=Blog+Post';
                    }}
                  />
                </div>
              )}
              
              <div 
                className="prose prose-lg prose-invert max-w-none prose-headings:text-white prose-headings:font-archivo prose-a:text-[#3bcf9a] prose-a:font-medium prose-img:rounded-lg prose-ul:text-white prose-ol:text-white prose-li:text-gray-300 prose-li:marker:text-[#3bcf9a] prose-pre:bg-[#0d0d0d] prose-pre:border prose-pre:border-gray-800 prose-pre:rounded-lg prose-code:text-[#3bcf9a] prose-code:bg-[rgba(59,207,154,0.1)] prose-code:p-1 prose-code:rounded prose-p:text-gray-300 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h4:text-lg prose-h4:font-semibold prose-h4:mt-4 prose-blockquote:border-l-4 prose-blockquote:border-[#3bcf9a] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400 prose-hr:border-gray-800 prose-img:cursor-pointer"
                dangerouslySetInnerHTML={{ __html: blogPost.content }}
              />
            </article>
            
            <div className="py-16">
              <ConnectWithMe />
            </div>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 