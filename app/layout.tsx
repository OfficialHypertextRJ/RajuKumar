import './globals.css';
import type { Metadata } from 'next';
import { Inter, Roboto, Archivo_Black } from 'next/font/google';
import ThemeRegistry from '@/components/ThemeRegistry';
import MouseGradientBackground from '@/components/MouseGradientBackground';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});
const archivoBlack = Archivo_Black({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo-black',
});

export const metadata: Metadata = {
  title: 'Raju Kumar',
  description: 'My professional portfolio showcasing my skills and projects',
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
    } catch(e) {}
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
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet" />
        {/* Preload script to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: preloadScript }} />
        <style dangerouslySetInnerHTML={{ __html: `
          html, body {
            background-color: rgb(13, 13, 13) !important;
            margin: 0;
            padding: 0;
            transition: background-color 0ms;
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