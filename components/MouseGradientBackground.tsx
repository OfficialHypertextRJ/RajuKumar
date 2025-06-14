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

    window.addEventListener('resize', handleResize);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    let outerX = window.innerWidth / 2;
    let outerY = window.innerHeight / 2;
    
    let innerX = window.innerWidth / 2;
    let innerY = window.innerHeight / 2;
    
    // Position history for super smooth movement
    const positionHistory: {x: number, y: number}[] = [];
    const historyMaxLength = 10;
    
    // Initialize history
    for (let i = 0; i < historyMaxLength; i++) {
      positionHistory.push({x: mouseX, y: mouseY});
    }
    
    // Add velocity for smoother movement
    let outerVelocityX = 0;
    let outerVelocityY = 0;
    let innerVelocityX = 0;
    let innerVelocityY = 0;
    
    // Keep track of previous velocities for smoothing
    const outerVelocityHistory = {x: [0, 0, 0], y: [0, 0, 0]};
    const innerVelocityHistory = {x: [0, 0, 0], y: [0, 0, 0]};
    
    // Set initial position for gradients
    outerGradientRef.current.style.left = `${outerX - 700}px`;
    outerGradientRef.current.style.top = `${outerY - 700}px`;
    innerGradientRef.current.style.left = `${innerX - 400}px`;
    innerGradientRef.current.style.top = `${innerY - 400}px`;
    
    // Update mouse position history for smoother movement
    const updateHistory = (x: number, y: number) => {
      // Add new position to history
      positionHistory.unshift({x, y});
      
      // Remove oldest history if too long
      if (positionHistory.length > historyMaxLength) {
        positionHistory.pop();
      }
      
      // Calculate weighted average position
      let totalX = 0;
      let totalY = 0;
      let totalWeight = 0;
      
      for (let i = 0; i < positionHistory.length; i++) {
        // Weight decreases with age (newer positions have more influence)
        const weight = positionHistory.length - i;
        totalX += positionHistory[i].x * weight;
        totalY += positionHistory[i].y * weight;
        totalWeight += weight;
      }
      
      return {
        x: totalX / totalWeight,
        y: totalY / totalWeight
      };
    };
    
    // Track mouse position directly
    const handleMouseMove = (e: MouseEvent) => {
      // Update cursor position
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Update history
      updateHistory(mouseX, mouseY);
    };
    
    // Update velocity history for even smoother movement
    const updateVelocityHistory = (velocityHistory: {x: number[], y: number[]}, newVelocityX: number, newVelocityY: number) => {
      // Add new velocities
      velocityHistory.x.unshift(newVelocityX);
      velocityHistory.y.unshift(newVelocityY);
      
      // Remove oldest if too long
      if (velocityHistory.x.length > 3) {
        velocityHistory.x.pop();
        velocityHistory.y.pop();
      }
      
      // Calculate weighted average
      let totalX = 0;
      let totalY = 0;
      let totalWeight = 0;
      
      for (let i = 0; i < velocityHistory.x.length; i++) {
        const weight = velocityHistory.x.length - i;
        totalX += velocityHistory.x[i] * weight;
        totalY += velocityHistory.y[i] * weight;
        totalWeight += weight;
      }
      
      return {
        x: totalX / totalWeight,
        y: totalY / totalWeight
      };
    };

    // Animate gradients with ultra-smooth physics
    const animateGradient = () => {
      if (!outerGradientRef.current || !innerGradientRef.current) return;
      
      // Get smoothed mouse position
      const smoothedPosition = updateHistory(mouseX, mouseY);
      
      // Physics for outer gradient (slower, smoother)
      const outerFriction = 0.15; // Lower friction for smoother movement
      const outerAttraction = 0.05; // Lower attraction for smoother movement
      
      // Physics for inner gradient (slightly faster)
      const innerFriction = 0.08; // Very low friction for ultra-smooth movement
      const innerAttraction = 0.07; // Low attraction for smoother movement
      
      // Calculate distance to smoothed cursor
      const outerDistanceX = smoothedPosition.x - outerX;
      const outerDistanceY = smoothedPosition.y - outerY;
      const innerDistanceX = smoothedPosition.x - innerX;
      const innerDistanceY = smoothedPosition.y - innerY;
      
      // Apply physics for outer gradient
      let newOuterVelocityX = outerVelocityX * outerFriction + outerDistanceX * outerAttraction;
      let newOuterVelocityY = outerVelocityY * outerFriction + outerDistanceY * outerAttraction;
      
      // Apply physics for inner gradient
      let newInnerVelocityX = innerVelocityX * innerFriction + innerDistanceX * innerAttraction;
      let newInnerVelocityY = innerVelocityY * innerFriction + innerDistanceY * innerAttraction;
      
      // Apply super smooth velocity using velocity history
      const smoothedOuterVelocity = updateVelocityHistory(outerVelocityHistory, newOuterVelocityX, newOuterVelocityY);
      const smoothedInnerVelocity = updateVelocityHistory(innerVelocityHistory, newInnerVelocityX, newInnerVelocityY);
      
      outerVelocityX = smoothedOuterVelocity.x;
      outerVelocityY = smoothedOuterVelocity.y;
      innerVelocityX = smoothedInnerVelocity.x;
      innerVelocityY = smoothedInnerVelocity.y;
      
      // Apply speed limits for stability
      const maxOuterSpeed = 10;
      const maxInnerSpeed = 15;
      
      const outerSpeedX = Math.abs(outerVelocityX);
      const outerSpeedY = Math.abs(outerVelocityY);
      const innerSpeedX = Math.abs(innerVelocityX);
      const innerSpeedY = Math.abs(innerVelocityY);
      
      if (outerSpeedX > maxOuterSpeed) {
        outerVelocityX = (outerVelocityX / outerSpeedX) * maxOuterSpeed;
      }
      
      if (outerSpeedY > maxOuterSpeed) {
        outerVelocityY = (outerVelocityY / outerSpeedY) * maxOuterSpeed;
      }
      
      if (innerSpeedX > maxInnerSpeed) {
        innerVelocityX = (innerVelocityX / innerSpeedX) * maxInnerSpeed;
      }
      
      if (innerSpeedY > maxInnerSpeed) {
        innerVelocityY = (innerVelocityY / innerSpeedY) * maxInnerSpeed;
      }
      
      // Update gradient positions
      outerX += outerVelocityX;
      outerY += outerVelocityY;
      innerX += innerVelocityX;
      innerY += innerVelocityY;
      
      // Apply positions to DOM with smoothing (adjusted for smaller size)
      outerGradientRef.current.style.left = `${outerX - 700}px`;
      outerGradientRef.current.style.top = `${outerY - 700}px`;
      innerGradientRef.current.style.left = `${innerX - 400}px`;
      innerGradientRef.current.style.top = `${innerY - 400}px`;
      
      // Continue animation loop
      requestAnimationFrame(animateGradient);
    };
    
    // Add event listeners
    window.addEventListener("mousemove", handleMouseMove);
    
    // Start animation loop
    const animationFrame = requestAnimationFrame(animateGradient);

    // Clean up
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

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
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: -1,
          overflow: "hidden",
          backdropFilter: "blur(100px)",
          WebkitBackdropFilter: "blur(100px)",
          backgroundColor: "rgb(13, 13, 13)",
          opacity: isLoaded ? 0.9 : 0,
          transition: "opacity 0.3s ease-in",
        }}
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
      
        <div
          ref={outerGradientRef}
          style={{
            position: "absolute",
            width: "1400px",
            height: "1400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(56, 178, 172, 0.06) 0%, rgba(56, 178, 172, 0) 65%)",
            mixBlendMode: "screen",
            filter: "blur(140px)",
            WebkitFilter: "blur(140px)",
            opacity: 0.8,
          }}
        />
        <div
          ref={innerGradientRef}
          style={{
            position: "absolute",
            width: "800px",
            height: "800px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0) 65%)",
            mixBlendMode: "screen",
            filter: "blur(100px)",
            WebkitFilter: "blur(100px)",
            opacity: 0.8,
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