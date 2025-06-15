"use client";

import React, { useRef, useEffect, useState } from "react";

// Add this script to be injected in the head
const PRELOAD_SCRIPT = `
  document.documentElement.style.backgroundColor = "rgb(13, 13, 13)";
  document.body.style.backgroundColor = "rgb(13, 13, 13)";
`;

const MouseGradientBackground = () => {
  const outerGradientRef = useRef<HTMLDivElement>(null);
  const innerGradientRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Apply styles immediately
  useEffect(() => {
    // Apply dark background immediately to prevent flash
    if (typeof window !== 'undefined') {
      document.documentElement.style.backgroundColor = "rgb(13, 13, 13)";
      document.body.style.backgroundColor = "rgb(13, 13, 13)";
      
      // Create and add a style element to ensure background color persists during refresh
      const style = document.createElement('style');
      style.textContent = `
        html, body {
          background-color: rgb(13, 13, 13) !important;
          transition: background-color 0s;
        }
      `;
      document.head.appendChild(style);
      
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsReducedMotion(prefersReducedMotion);
    }
    
    // Set loaded state after a small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Skip if running on server or ref isn't attached
    if (typeof window === 'undefined' || !outerGradientRef.current || !innerGradientRef.current) return;

    // Apply initial styling immediately
    const applyInitialStyles = () => {
      if (!outerGradientRef.current || !innerGradientRef.current) return;
      
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      outerGradientRef.current.style.left = `${centerX - 700}px`;
      outerGradientRef.current.style.top = `${centerY - 700}px`;
      innerGradientRef.current.style.left = `${centerX - 400}px`;
      innerGradientRef.current.style.top = `${centerY - 400}px`;
    };
    
    // Call this immediately
    applyInitialStyles();

    // Handle window resize to keep gradients centered
    const handleResize = () => {
      applyInitialStyles();
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // If user prefers reduced motion, don't animate
    if (isReducedMotion) {
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    let outerX = window.innerWidth / 2;
    let outerY = window.innerHeight / 2;
    
    let innerX = window.innerWidth / 2;
    let innerY = window.innerHeight / 2;
    
    // Simplified position tracking
    let lastMouseX = mouseX;
    let lastMouseY = mouseY;
    
    // Add velocity for smoother movement
    let outerVelocityX = 0;
    let outerVelocityY = 0;
    let innerVelocityX = 0;
    let innerVelocityY = 0;
    
    // Set initial position for gradients
    outerGradientRef.current.style.left = `${outerX - 700}px`;
    outerGradientRef.current.style.top = `${outerY - 700}px`;
    innerGradientRef.current.style.left = `${innerX - 400}px`;
    innerGradientRef.current.style.top = `${innerY - 400}px`;
    
    // Track mouse position with passive listener
    const handleMouseMove = (e: MouseEvent) => {
      // Update cursor position
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Simple smoothing
      lastMouseX = mouseX;
      lastMouseY = mouseY;
    };
    
    // Animate gradients with simplified physics
    let animationFrameId: number;
    
    const animateGradient = () => {
      if (!outerGradientRef.current || !innerGradientRef.current) return;
      
      // Physics for outer gradient (slower, smoother)
      const outerFriction = 0.85; // Higher friction for less CPU usage
      const outerAttraction = 0.05;
      
      // Physics for inner gradient (slightly faster)
      const innerFriction = 0.92; // Higher friction for less CPU usage
      const innerAttraction = 0.07;
      
      // Calculate distance to cursor
      const outerDistanceX = lastMouseX - outerX;
      const outerDistanceY = lastMouseY - outerY;
      const innerDistanceX = lastMouseX - innerX;
      const innerDistanceY = lastMouseY - innerY;
      
      // Apply simplified physics
      outerVelocityX = outerVelocityX * outerFriction + outerDistanceX * outerAttraction;
      outerVelocityY = outerVelocityY * outerFriction + outerDistanceY * outerAttraction;
      innerVelocityX = innerVelocityX * innerFriction + innerDistanceX * innerAttraction;
      innerVelocityY = innerVelocityY * innerFriction + innerDistanceY * innerAttraction;
      
      // Apply speed limits for stability
      const maxOuterSpeed = 10;
      const maxInnerSpeed = 15;
      
      outerVelocityX = Math.max(Math.min(outerVelocityX, maxOuterSpeed), -maxOuterSpeed);
      outerVelocityY = Math.max(Math.min(outerVelocityY, maxOuterSpeed), -maxOuterSpeed);
      innerVelocityX = Math.max(Math.min(innerVelocityX, maxInnerSpeed), -maxInnerSpeed);
      innerVelocityY = Math.max(Math.min(innerVelocityY, maxInnerSpeed), -maxInnerSpeed);
      
      // Update gradient positions
      outerX += outerVelocityX;
      outerY += outerVelocityY;
      innerX += innerVelocityX;
      innerY += innerVelocityY;
      
      // Apply positions with transform instead of left/top for better performance
      outerGradientRef.current.style.transform = `translate3d(${outerX - 700}px, ${outerY - 700}px, 0)`;
      innerGradientRef.current.style.transform = `translate3d(${innerX - 400}px, ${innerY - 400}px, 0)`;
      
      // Continue animation loop
      animationFrameId = requestAnimationFrame(animateGradient);
    };

    // Start animation
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(animateGradient);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isReducedMotion]);

  return (
    <>
      {/* Inject script to prevent flash */}
      <script dangerouslySetInnerHTML={{ __html: PRELOAD_SCRIPT }} />
      
      <style jsx global>{`
        html, body {
          background: rgb(13, 13, 13) !important;
          margin: 0;
          padding: 0;
        }
        
        body {
          background-color: rgb(13, 13, 13) !important;
          transition: background-color 0s !important;
        }
        
        section, div, main {
          background-color: transparent !important;
        }
        
        section[id] {
          position: relative;
          z-index: 1;
        }
      `}</style>
      <div
        ref={containerRef}
        className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-[-1]"
        aria-hidden="true"
        style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}
      >
        <div className="blur-overlay" style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: "blur(100px)",
          WebkitBackdropFilter: "blur(100px)",
          zIndex: 1
        }} />
      
        {/* Outer gradient - larger, more subtle */}
        <div
          ref={outerGradientRef}
          className="absolute w-[1400px] h-[1400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 207, 154, 0.03) 0%, rgba(13, 13, 13, 0) 70%)',
            willChange: 'transform',
          }}
        />
        
        {/* Inner gradient - smaller, more vibrant */}
        <div
          ref={innerGradientRef}
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 207, 154, 0.07) 0%, rgba(13, 13, 13, 0) 70%)',
            willChange: 'transform',
          }}
        />
      </div>

      {/* Fixed background color to prevent white/black flash */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgb(13, 13, 13)",
        zIndex: -2,
      }} />
    </>
  );
};

export default MouseGradientBackground; 