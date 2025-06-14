'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchHeroContent } from '@/lib/fetchContent';
import BlurText from "./BlurText";
import AnimatedImage from "./AnimatedImage";

interface HeroContent {
  heading: string;
  subheading?: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  images: string[];
}

const defaultContent: HeroContent = {
  heading: 'Software Developer and Data Analyst',
  description: "I'm Snehil, a AI/ML intern at TIH IIT BHILAI, where I craft intuitive ML models. After hours, I build my own projects.",
  buttonText: 'About me',
  buttonLink: '/about',
  images: [
    'https://storage.googleapis.com/a1aa/image/6a773b1f-01f2-4a5e-8472-2ffaac8a3481.jpg',
    'https://storage.googleapis.com/a1aa/image/2e299343-05dc-40df-9297-17be26e3ce9d.jpg',
    'https://storage.googleapis.com/a1aa/image/77faebce-d27c-4109-bdcd-ff214f8d23de.jpg'
  ]
};

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [content, setContent] = useState<HeroContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [textAnimationComplete, setTextAnimationComplete] = useState(false);

  const handleAnimationComplete = () => {
    setTextAnimationComplete(true);
    console.log('Animation completed!');
  };

  useEffect(() => {
    // Fetch content from Firebase
    const loadContent = async () => {
      try {
        const heroContent = await fetchHeroContent();
        if (heroContent) {
          setContent({
            heading: heroContent.heading || defaultContent.heading,
            subheading: heroContent.subheading,
            description: heroContent.description || defaultContent.description,
            buttonText: heroContent.buttonText || defaultContent.buttonText,
            buttonLink: heroContent.buttonLink || defaultContent.buttonLink,
            images: heroContent.images && heroContent.images.length === 3 
              ? heroContent.images 
              : defaultContent.images
          });
        }
      } catch (error) {
        console.error("Error loading hero content:", error);
        // Use default content on error
      } finally {
        setLoading(false);
        // Start animation immediately after content is loaded
        setTimeout(() => setIsVisible(true), 100);
        setTimeout(() => setAnimationComplete(true), 3000);
      }
    };
    
    loadContent();
  }, []);

  // Show a simple loading state
  if (loading) {
    return (
      <main className="px-4 max-w-6x2 mx-auto flex-grow pt-6 md:pt-10">
        <div className="mt-1 md:mt-10 max-w-3xl ml-0 mr-auto md:ml-8 lg:ml-96 animate-pulse">
          <div className="h-12 bg-gray-700 rounded mb-4 w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded mb-2 w-full"></div>
          <div className="h-4 bg-gray-700 rounded mb-2 w-5/6"></div>
          <div className="h-4 bg-gray-700 rounded mb-6 w-4/6"></div>
          <div className="h-48 bg-gray-800 rounded mb-4"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 max-w-6x2 mx-auto flex-grow pt-6 md:pt-10">
      <section id="home" className="mt-1 md:mt-10 max-w-3xl ml-0 mr-auto md:ml-20 lg:ml-96">
        {/* Whole section wrapper with subtle fade-in */}
        <div className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {/* Heading with blur text animation */}
          <div className="relative overflow-hidden">
            <div className={`text-[2.95rem] sm:text-3xl md:text-[3.5rem] font-extrabold leading-tight md:leading-[1.05] mb-6 ${animationComplete ? 'text-blod' : ''} font-archivo`}>
              {/* Different layout for mobile vs desktop */}
              <div className="md:hidden">
                <BlurText
                  text={content.heading}
                  delay={150}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                  className="text-[2.95rem] font-extrabold"
                />
              </div>
              <div className="hidden md:block">
                <BlurText
                  text={content.heading}
                  delay={150}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                  className="text-[3.5rem] font-extrabold"
                />
              </div>
              
              {content.subheading && (
                <div className="block text-[1.5rem] md:text-[2rem] text-gray-400 mt-2">
                  <BlurText
                    text={content.subheading}
                    delay={200}
                    animateBy="words"
                    direction="top"
                    className="text-gray-400"
                  />
                </div>
              )}
            </div>
            <div 
              className={`absolute top-0 left-0 w-full h-full bg-[#0d0d0d] transform transition-all duration-1000 ease-in-out ${isVisible ? 'translate-x-full' : 'translate-x-0'}`}
              style={{ backgroundColor: '#0d0d0d', zIndex: 1 }}
            ></div>
          </div>
          
          {/* Paragraph with blur text animation */}
          <div className="relative overflow-hidden">
            <div className="text-gray-400 text-[1.30rem] mb-6 md:mb-6 max-w-xl text-left">
              <BlurText
                text={content.description}
                delay={150}
                animateBy="words"
                direction="top"
                className="text-gray-400 text-[1.30rem]"
              />
            </div>
            <div 
              className={`absolute top-0 left-0 w-full h-full bg-[#0d0d0d] transform transition-all duration-1000 ease-in-out ${isVisible ? 'translate-x-full' : 'translate-x-0'}`}
              style={{ transitionDelay: isVisible ? '300ms' : '0ms', backgroundColor: '#0d0d0d', zIndex: 1 }}
            ></div>
          </div>
          
          {/* Image Gallery with blur animation */}
          <div className="relative overflow-hidden mt-6">
            <div className="w-full" style={{ aspectRatio: '16/9' }}>
              <div className="flex rounded-lg overflow-hidden w-full h-full">
                {content.images.map((image, index) => (
                  <div className="w-1/3 overflow-hidden relative" key={index}>
                    <AnimatedImage 
                        src={image} 
                        alt={`Portfolio image ${index + 1}`}
                        priority={true}
                      index={index}
                      />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Button with reveal animation */}
          <div className="relative overflow-hidden mt-10">
            <div className="flex flex-wrap gap-2">
              <Link 
                href={content.buttonLink}
                className="group inline-flex items-center text-white text-[0.85rem] font-semibold rounded-full px-4 py-2 bg-transparent border border-white/20 hover:border-white/40 hover:pr-6 transition-all duration-700" 
              >
                <Image 
                  alt="User avatar icon" 
                  className="rounded-full w-6 h-6 mr-2" 
                  height={24}
                  width={24}
                  src="https://firebasestorage.googleapis.com/v0/b/rj-ekart-firebase.appspot.com/o/hero%2Fimage-1-1749741606059-WhatsApp%20Image%202024-10-29%20at%2010.30.27%20PM.jpeg?alt=media&token=589f7810-8207-436f-b66b-054518360ffe" 
                  priority={true}
                />
                <span>{content.buttonText}</span>
                <i className="fas fa-long-arrow-alt-right text-[1rem] opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-4 transition-all duration-700"></i>
              </Link>
            </div>
            <div 
              className={`absolute top-0 left-0 w-full h-full bg-[#0d0d0d] transform transition-all duration-1000 ease-in-out ${isVisible ? 'translate-x-full' : 'translate-x-0'}`}
              style={{ transitionDelay: isVisible ? '450ms' : '0ms', backgroundColor: '#0d0d0d', zIndex: 1 }}
            ></div>
          </div>
        </div>
      </section>

      {/* Add styles for the glowing text effect */}
      <style jsx global>{`
        .text-glow {
          text-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
          animation: textPulse 5s infinite alternate;
        }
        
        @keyframes textPulse {
          0% {
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
          }
          100% {
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 15px rgba(56, 178, 172, 0.3);
          }
        }
      `}</style>
    </main>
  );
};

export default Hero; 