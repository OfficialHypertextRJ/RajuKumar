'use client';

import React, { memo } from 'react';
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
  // Animation variants for the blur effect - reduced duration for faster display
  const variants = {
    hidden: {
      opacity: 0,
      filter: 'blur(8px)',
      scale: 1.03,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      transition: {
        delay: Math.min(index * 0.1, 0.3), // Cap the delay to prevent slow loading
        duration: 0.5, // Reduced from 1s to 0.5s for faster animation
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
      />
    </motion.div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(AnimatedImage); 