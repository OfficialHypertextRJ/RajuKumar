'use client';

import React, { Suspense, lazy, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import NavigationMenu from '@/components/NavigationMenu';
import Hero from '@/components/Hero';
import Projects from '@/components/Projects';
import Blog from '@/components/Blog';
import ContactInfo from '@/components/ContactInfo';
import Footer from '@/components/Footer';
import { useMediaQuery, useTheme } from '@mui/material';

// Lazy load the ConnectWithMe component
const ConnectWithMe = lazy(() => import('@/components/ConnectWithMe'));

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showConnect, setShowConnect] = useState(false);
  
  // Only show ConnectWithMe component after page has loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConnect(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <Navbar />
      <NavigationMenu />
      <div className="h-[70px] sm:h-0" aria-hidden="true"></div>
      <main className="pt-4 pb-0">
        <Hero />
        <Projects />
        <Blog />
        {showConnect && (
          <Suspense fallback={<div style={{ height: '200px' }}></div>}>
            <ConnectWithMe />
          </Suspense>
        )}
        <ContactInfo />
      </main>
      <Footer />
    </>
  );
} 