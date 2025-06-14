'use client';

import React, { useState, useEffect } from 'react';
import { fetchAllProjects } from '@/lib/fetchContent';
import { useTheme, useMediaQuery } from '@mui/material';
import MouseGradientBackground from '@/components/MouseGradientBackground';
import ProjectImage from '@/components/ProjectImage';
import Navbar from '@/components/Navbar';
import NavigationMenu from '@/components/NavigationMenu';
import Footer from '@/components/Footer';
import { FiGithub, FiExternalLink } from 'react-icons/fi';

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

export default function ProjectsPage() {
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();
  const isLaptopOrLarger = useMediaQuery('(min-width: 1024px)');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageIndices, setImageIndices] = useState<number[]>([]);
  const [changingImages, setChangingImages] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // Make content visible with a short delay on mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Fetch all projects
    const loadProjects = async () => {
      const allProjects = await fetchAllProjects();
      if (allProjects && allProjects.length > 0) {
        setProjects(allProjects);
        setImageIndices(new Array(allProjects.length).fill(0));
      }
      setLoading(false);
    };
    
    loadProjects();

    return () => clearTimeout(timer);
  }, []);

  // Get valid images for a project
  const getValidImages = (project: Project) => {
    return project.images ? project.images.filter(img => img && img.trim() !== '') : [];
  };

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
        const validImages = getValidImages(projects[projectIndex]);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(13,13,13)]">
        <MouseGradientBackground />
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#3bcf9a]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <MouseGradientBackground />
      <Navbar />
      <NavigationMenu />
      <div className="h-[70px] sm:h-0" aria-hidden="true"></div>
      
      <main className={`flex-1 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-20 mb-20 max-w-3xl mx-auto">
            {projects.map((project, projectIndex) => (
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
                        src={getValidImages(project).length > 0 
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
                            className={`h-[4px] flex-1 transition-all duration-300 bg-white border`}
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 