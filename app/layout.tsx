import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Roboto, Archivo_Black } from 'next/font/google';
import ThemeRegistry from '@/components/ThemeRegistry';
import MouseGradientBackground from '@/components/MouseGradientBackground';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';

// Optimize font loading
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const roboto = Roboto({
  weight: ['400', '500', '700'], // Reduced font weights
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
  preload: true,
});

const archivoBlack = Archivo_Black({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo-black',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Raju Kumar',
  description: 'My professional portfolio showcasing my skills and projects',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'mobile-web-app-capable': 'yes',
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0d0d0d',
};

// Preload script to prevent flash of white background
const preloadScript = `
  (function() {
    try {
      document.documentElement.style.backgroundColor = "rgb(13, 13, 13)";
      document.body.style.backgroundColor = "rgb(13, 13, 13)";
      
      // Store background color in sessionStorage to maintain during refresh
      sessionStorage.setItem('bgColor', 'rgb(13, 13, 13)');
      
      // Check if we're refreshing
      if (performance && performance.navigation && performance.navigation.type === 1) {
        // This is a refresh, ensure background is set immediately
        document.documentElement.style.transition = 'none';
        document.body.style.transition = 'none';
      }
      
      // Add passive event listeners for better scrolling performance
      if (typeof window !== 'undefined') {
        // Test passive event listener support
        let supportsPassive = false;
        try {
          const opts = Object.defineProperty({}, 'passive', {
            get: function() { supportsPassive = true; return true; }
          });
          window.addEventListener('testPassive', null, opts);
          window.removeEventListener('testPassive', null, opts);
        } catch (e) {}
        
        // Apply passive listeners to touch and wheel events
        if (supportsPassive) {
          const wheelOpt = supportsPassive ? { passive: true } : false;
          const wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
          
          window.addEventListener('touchstart', function(){}, wheelOpt);
          window.addEventListener('touchmove', function(){}, wheelOpt);
          window.addEventListener(wheelEvent, function(){}, wheelOpt);
        }
      }
    } catch(e) {}
  })();
`;

// Script to load font awesome asynchronously
const loadFontAwesomeScript = `
  (function() {
    function loadCSS(href) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
    
    // Load Font Awesome CSS files
    loadCSS('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/solid.min.css');
    loadCSS('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/fontawesome.min.css');
  })();
`;

// Preload key API data for faster navigation
const preloadDataScript = `
  (function() {
    // Prefetch about page data
    function prefetchData() {
      try {
        // Prefetch the about data in background
        fetch('/api/about')
          .then(response => {
            if (!response.ok) throw new Error('Failed to prefetch about data');
            return response.json();
          })
          .then(data => {
            // Store in sessionStorage for immediate access
            sessionStorage.setItem('prefetched_about_data', JSON.stringify(data));
            sessionStorage.setItem('prefetched_about_timestamp', Date.now().toString());
          })
          .catch(error => console.error('Error prefetching about data:', error));
      } catch(e) {
        console.error('Error in prefetch script:', e);
      }
    }
    
    // Run after a short delay to prioritize main page load
    setTimeout(prefetchData, 2000);
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${roboto.variable} ${inter.variable} ${archivoBlack.variable}`}>
      <head>
        {/* Preconnect to CDN */}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        
        {/* Preload script to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: preloadScript }} />
        
        {/* Load Font Awesome asynchronously */}
        <Script id="load-fontawesome" strategy="afterInteractive">
          {loadFontAwesomeScript}
        </Script>
        
        {/* Preload key API data */}
        <Script id="preload-data" strategy="afterInteractive">
          {preloadDataScript}
        </Script>
        
        <style dangerouslySetInnerHTML={{ __html: `
          html, body {
            background-color: rgb(13, 13, 13) !important;
            margin: 0;
            padding: 0;
            transition: background-color 0ms;
            overscroll-behavior-y: none;
          }
          
          body::before {
            content: "";
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgb(13, 13, 13);
            z-index: -10;
          }
          
          /* Force background color during refresh */
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          
          body {
            animation: fadeIn 0.3s ease-out;
            animation-fill-mode: forwards;
            text-rendering: optimizeSpeed;
            -webkit-font-smoothing: antialiased;
          }
          
          /* Optimize scrolling */
          * {
            -webkit-overflow-scrolling: touch;
          }
          
          /* Use hardware acceleration where possible */
          .will-change-transform {
            will-change: transform;
          }
        `}} />
      </head>
      <body className="text-white min-h-screen flex flex-col bg-[rgb(13,13,13)]">
        <MouseGradientBackground />
        <Toaster position="top-center" toastOptions={{ 
          style: { 
            background: '#222', 
            color: '#fff',
            borderRadius: '8px',
            padding: '16px'
          },
          success: {
            iconTheme: {
              primary: '#3bcf9a',
              secondary: '#000'
            }
          }
        }} />
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
} 