'use client';

import React, { useState, useEffect } from 'react';
import { FiGithub, FiExternalLink } from 'react-icons/fi';
import { fetchFeaturedProjects } from '@/lib/fetchContent';
import ProjectImage from './ProjectImage';

interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  github: string;
  demo: string;
  tags?: string[];
  featured?: boolean;
}

const defaultProjects: Project[] = [
  {
    id: '1',
    title: "Algo-Wave - Visualize CPU Scheduling Algorithms Like Never Before!",
    description: "AlgoWave is a comprehensive CPU scheduling and resource allocation algorithm simulator designed to help students, educators, and professionals understand the fundamentals of operating system process management and resource allocation.",
    images: [
      "https://storage.googleapis.com/a1aa/image/6a773b1f-01f2-4a5e-8472-2ffaac8a3481.jpg",
      "https://storage.googleapis.com/a1aa/image/2e299343-05dc-40df-9297-17be26e3ce9d.jpg",
      "https://storage.googleapis.com/a1aa/image/77faebce-d27c-4109-bdcd-ff214f8d23de.jpg"
    ],
    github: "#",
    demo: "#"
  },
  {
    id: '2',
    title: "E-Commerce Website",
    description: "A full-featured e-commerce platform with product listings, cart functionality, user authentication, and payment integration using React and Node.js.",
    images: [
      "https://storage.googleapis.com/a1aa/image/2e299343-05dc-40df-9297-17be26e3ce9d.jpg",
      "https://storage.googleapis.com/a1aa/image/6a773b1f-01f2-4a5e-8472-2ffaac8a3481.jpg",
      "https://storage.googleapis.com/a1aa/image/77faebce-d27c-4109-bdcd-ff214f8d23de.jpg"
    ],
    github: "#",
    demo: "#"
  },
  {
    id: '3',
    title: "Portfolio Website",
    description: "A modern, responsive portfolio website built with Next.js, TypeScript, and TailwindCSS to showcase skills and projects with smooth animations and dark theme.",
    images: [
      "https://storage.googleapis.com/a1aa/image/77faebce-d27c-4109-bdcd-ff214f8d23de.jpg",
      "https://storage.googleapis.com/a1aa/image/6a773b1f-01f2-4a5e-8472-2ffaac8a3481.jpg",
      "https://storage.googleapis.com/a1aa/image/2e299343-05dc-40df-9297-17be26e3ce9d.jpg"
    ],
    github: "#",
    demo: "#"
  }
];

const Projects = () => {
  // Animation state
  const [isVisible, setIsVisible] = useState(false);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>(defaultProjects);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch featured projects from Firebase
    const loadProjects = async () => {
      const projects = await fetchFeaturedProjects();
      if (projects && projects.length > 0) {
        setFeaturedProjects(projects);
      }
      setLoading(false);
    };
    
    loadProjects();
    
    // Trigger animation when component mounts
    setIsVisible(true);
    
    // Add scroll event listener to trigger animations when scrolling to the section
    const handleScroll = () => {
      const projectsSection = document.getElementById('projects');
      if (projectsSection) {
        const rect = projectsSection.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom >= 0;
        if (isInView) {
          setIsVisible(true);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Use separate image index states for each project
  const [imageIndices, setImageIndices] = useState<number[]>([]);
  const [changingImages, setChangingImages] = useState<Record<number, boolean>>({});
  
  // Initialize image indices when projects are loaded
  useEffect(() => {
    if (featuredProjects.length > 0) {
      setImageIndices(new Array(featuredProjects.length).fill(0));
    }
  }, [featuredProjects]);

  const handleImageClick = (projectIndex: number) => {
    // Mark image as changing for animation
    setChangingImages(prev => ({
      ...prev,
      [projectIndex]: true
    }));

    // Delay changing the actual image to allow animation to play
    setTimeout(() => {
      // Cycle through images for the specific project
      setImageIndices(prev => {
        const newIndices = [...prev];
        // Filter out empty image URLs
        const validImages = featuredProjects[projectIndex].images.filter(img => img && img.trim() !== '');
        if (validImages.length > 1) {
          newIndices[projectIndex] = (newIndices[projectIndex] + 1) % validImages.length;
        }
        return newIndices;
      });
      
      // Set a short timeout before making the new image visible
      setTimeout(() => {
        setChangingImages(prev => ({
          ...prev,
          [projectIndex]: false
        }));
      }, 100);
    }, 300);
  };

  // Get valid images for a project
  const getValidImages = (project: Project) => {
    return project.images ? project.images.filter(img => img && img.trim() !== '') : [];
  };

  // Calculate animation delay based on project index
  const getAnimationDelay = (index: number) => {
    return `${200 * index}ms`;
  };
  
  // Don't render until content is loaded
  if (loading) {
    return null;
  }

  return (
    <section id="projects" className="section py-16 m-4">
      <div className="px-4 max-w-6xl mx-auto">
        
        {/* Featured Projects - Vertical Layout */}
        <div className="space-y-20 mb-20 max-w-3xl mx-auto">
          {featuredProjects.map((project, projectIndex) => (
            <div 
              key={project.id} 
              className="mb-12 relative overflow-hidden"
            >
              {/* Project content */}
              <div className="relative">
                {/* Image carousel */}
                <div className="mb-8 relative">
                  <div className="overflow-hidden rounded-lg h-[250px] md:h-[500px] w-full">
                    <ProjectImage 
                      src={project.images && project.images.length > 0 
                        ? getValidImages(project)[imageIndices[projectIndex] % Math.max(1, getValidImages(project).length)] 
                        : 'https://via.placeholder.com/800x500?text=No+Image'}
                      alt={`Project image ${imageIndices[projectIndex] + 1}`}
                      onImageClick={() => handleImageClick(projectIndex)}
                      isChanging={changingImages[projectIndex]}
                    />
                  </div>
                  
                  {/* Image indicators - white lines below image */}
                  {getValidImages(project).length > 1 && (
                    <div className="mt-2 mb-8 flex w-full gap-4 px-2">
                      {getValidImages(project).map((_, index) => (
                        <div 
                          key={index} 
                          className={`h-[6px] flex-1 transition-all duration-300 bg-white border`}
                          style={{
                            opacity: index === imageIndices[projectIndex] ? 1 : 0.4,
                            transform: index === imageIndices[projectIndex] ? 'scaleY(1.5)' : 'scaleY(1)',
                            borderColor: '#3bcf9a'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Mark image as changing
                            setChangingImages(prev => ({
                              ...prev,
                              [projectIndex]: true
                            }));

                            // Delay setting the new index
                            setTimeout(() => {
                              setImageIndices(prev => {
                                const newIndices = [...prev];
                                newIndices[projectIndex] = index;
                                return newIndices;
                              });
                              
                              // Set a short timeout before making the new image visible
                              setTimeout(() => {
                                setChangingImages(prev => ({
                                  ...prev,
                                  [projectIndex]: false
                                }));
                              }, 100);
                            }, 300);
                          }}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Project details */}
                <section className="flex flex-col md:flex-row gap-6 md:gap-12 text-white">
                  <div className="md:w-1/3 font-bold text-[20px] leading-tight font-archivo">
                    {project.title}
                  </div>
                  <div className="md:w-2/3 text-[#8a8a8a] text-[14px] leading-relaxed">
                    {project.description}
                    <div className="mt-4 flex gap-6 text-[#3bcf9a] text-[14px] font-semibold">
                      {project.github && (
                        <a 
                          className="flex items-center gap-1 hover:underline" 
                          href={project.github} 
                          rel="noopener noreferrer" 
                          target="_blank"
                        >
                          View on GitHub
                          <FiGithub className="ml-1" />
                        </a>
                      )}
                      {project.demo && (
                        <a 
                          className="flex items-center gap-1 hover:underline" 
                          href={project.demo} 
                          rel="noopener noreferrer" 
                          target="_blank"
                        >
                          Live Demo
                          <FiExternalLink className="ml-1" />
                        </a>
                      )}
                    </div>
                    
                    {project.tags && project.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.tags.map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="px-2 py-1 bg-[#1a1a1a] text-[#3bcf9a] text-xs rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <a 
            href="/projects" 
            className="inline-flex items-center text-[#3bcf9a] text-lg font-semibold hover:underline"
          >
            View All Projects
            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Projects; 