'use client';

import React, { memo, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getOptimizedImageUrl, getBlurDataUrl, getImageSizes } from '@/lib/imageOptimization';

interface AnimatedImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  index?: number;
  className?: string;
  width?: number;
  quality?: number;
}

const AnimatedImage: React.FC<AnimatedImageProps> = ({
  src,
  alt,
  priority = false,
  index = 0,
  className = '',
  width = 800,
  quality = 75,
}) => {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  
  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsReducedMotion(prefersReducedMotion);
    }
  }, []);

  // Animation variants for the blur effect - simplified for performance
  const variants = {
    hidden: {
      opacity: 0,
      filter: isReducedMotion ? 'blur(0px)' : 'blur(5px)',
      scale: isReducedMotion ? 1 : 1.02,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      transition: {
        delay: isReducedMotion ? 0 : Math.min(index * 0.05, 0.15), // Reduced delay
        duration: isReducedMotion ? 0.1 : 0.3, // Reduced duration
        ease: [0.2, 0.65, 0.3, 0.9],
      }
    }
  };

  // Optimize the image URL
  const optimizedSrc = getOptimizedImageUrl(src, width);

  return (
    <motion.div
      className={`w-full h-full relative ${className}`}
      initial="hidden"
      animate="visible"
      variants={variants}
      style={{ willChange: 'transform, opacity' }}
    >
      <Image
        src={optimizedSrc}
        alt={alt}
        fill
        sizes={getImageSizes()}
        style={{
          objectFit: 'cover',
          objectPosition: 'center'
        }}
        priority={priority}
        quality={quality}
        placeholder="blur"
        blurDataURL={getBlurDataUrl()}
        className="bg-[#0d0d0d]"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </motion.div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(AnimatedImage); 