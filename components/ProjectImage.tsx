'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getOptimizedImageUrl, getBlurDataUrl, getImageSizes } from '@/lib/imageOptimization';

interface ProjectImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  onImageClick?: () => void;
  className?: string;
  isChanging?: boolean;
  width?: number;
  quality?: number;
}

const ProjectImage: React.FC<ProjectImageProps> = ({
  src,
  alt,
  priority = false,
  onImageClick,
  className = '',
  isChanging = false,
  width = 800,
  quality = 75,
}) => {
  // Animation variants for the blur effect - optimized for performance
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
        duration: 0.5, // Reduced from 1s to 0.5s
        ease: [0.2, 0.65, 0.3, 0.9],
      }
    },
    changing: {
      opacity: 0,
      filter: 'blur(8px)',
      scale: 1.03,
      transition: {
        duration: 0.2, // Reduced from 0.3s to 0.2s
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
      animate={isChanging ? "changing" : "visible"}
      variants={variants}
      onClick={onImageClick}
    >
      <Image
        src={optimizedSrc}
        alt={alt}
        fill
        sizes={getImageSizes()}
        quality={quality}
        placeholder="blur"
        blurDataURL={getBlurDataUrl()}
        className="w-full h-full object-cover cursor-pointer"
        loading={priority ? "eager" : "lazy"}
      />
    </motion.div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(ProjectImage); 