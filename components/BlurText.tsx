'use client';

import React, { useState, useEffect } from 'react';
import { motion, useAnimationControls, Variants } from 'framer-motion';

interface BlurTextProps {
  text: string;
  delay?: number;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom' | 'left' | 'right';
  onAnimationComplete?: () => void;
  className?: string;
}

interface AnimationVariant {
  opacity: number;
  filter: string;
  x?: number;
  y?: number;
}

const BlurText: React.FC<BlurTextProps> = ({
  text,
  delay = 150,
  animateBy = 'letters',
  direction = 'bottom',
  onAnimationComplete,
  className = '',
}) => {
  const controls = useAnimationControls();
  const [animationDone, setAnimationDone] = useState(false);

  // Split text by words or letters
  const elements = animateBy === 'words' 
    ? text.split(' ')
    : text.split('');

  // Function to calculate variants based on direction
  const getVariants = (direction: string): Variants => {
    const hidden: AnimationVariant = {
      opacity: 0,
      filter: "blur(5px)",
    };
    
    const visible: AnimationVariant = {
      opacity: 1,
      filter: "blur(0px)",
    };

    // Add directional movement based on the direction
    switch (direction) {
      case 'top':
        hidden.y = -10;
        visible.y = 0;
        break;
      case 'bottom':
        hidden.y = 10;
        visible.y = 0;
        break;
      case 'left':
        hidden.x = -10;
        visible.x = 0;
        break;
      case 'right':
        hidden.x = 10;
        visible.x = 0;
        break;
      default:
        hidden.y = 10;
        visible.y = 0;
    }

    return {
      hidden,
      visible
    };
  };

  const variants = getVariants(direction);

  useEffect(() => {
    let isMounted = true;
    
    const startAnimation = async () => {
      if (!isMounted) return;
      
      // Check for reduced motion preference
      const prefersReducedMotion = typeof window !== 'undefined' && 
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (prefersReducedMotion) {
        // Skip animation for users who prefer reduced motion
        controls.set('visible');
        setAnimationDone(true);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      } else {
        await controls.start('visible');
        if (isMounted) {
          setAnimationDone(true);
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }
      }
    };

    // Small delay to ensure component is mounted
    const timer = setTimeout(startAnimation, 10);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [controls, onAnimationComplete]);

  return (
    <span className={className}>
      {elements.map((element, index) => (
        <motion.span
          key={index}
          custom={index}
          initial="hidden"
          animate={controls}
          variants={variants}
          transition={{
            delay: index * (delay / 1000),
            duration: 0.5,
            ease: [0.2, 0.65, 0.3, 0.9],
          }}
          className="inline-block hover:text-[#3bcf9a] transition-colors duration-300"
          style={{ 
            marginRight: animateBy === 'letters' ? '0px' : '0.25em',
            willChange: 'transform, opacity',
          }}
        >
          {element}
          {animateBy === 'letters' && element === ' ' ? '\u00A0' : ''}
        </motion.span>
      ))}
    </span>
  );
};

export default React.memo(BlurText); 