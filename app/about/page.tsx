'use client';

import Navbar from '@/components/Navbar';
import NavigationMenu from '@/components/NavigationMenu';
import Footer from '@/components/Footer';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { useMediaQuery, useTheme } from '@mui/material';
import { IoClose } from 'react-icons/io5';
import { fetchAboutContent } from '@/lib/fetchContent';

interface AboutData {
  name: string;
  designation: string;
  profileImage: string;
  location: string;
  languages: string[];
  introduction: string;
  links: {
    github: string;
    linkedin: string;
    email: string;
  };
  experience: {
    company: string;
    position: string;
    duration: string;
    description: string[];
    images: string[];
  }[];
  education: {
    institution: string;
    course?: string;
    department: string;
    percentage?: string;
    cgpa?: string;
    duration: string;
  }[];
  skills: {
    name: string;
    description: string;
    imageUrl?: string;
  }[];
}

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [isVisible, setIsVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isLaptopOrLarger = useMediaQuery('(min-width: 1024px)');

  const menuItems = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'work-experience', label: 'Work Experience' },
    { id: 'studies', label: 'Studies' },
    { id: 'technical-skills', label: 'Technical skills' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAboutContent();
        setAboutData(data);
      } catch (error) {
        console.error('Error fetching about data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openImage = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  const closeImage = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const yOffset = -100;
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  // Track scroll position to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = menuItems.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(menuItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Run immediately on mount to set the initial active section
    setTimeout(handleScroll, 100);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuItems]);

  useEffect(() => {
    // Make content visible with a short delay on mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const contentStyles = {
    marginLeft: 'calc(35% + 150px)',
    paddingRight: isLaptopOrLarger ? '300px' : '8px'
  };

  if (loading || !aboutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3bcf9a]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <NavigationMenu />
      <div className="h-[70px] sm:h-0" aria-hidden="true"></div>
      
      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl mx-auto">
            <button 
              onClick={closeImage} 
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 p-2 rounded-full transition-colors"
              aria-label="Close"
            >
              <IoClose size={24} />
            </button>
            <div className="relative w-full h-[80vh]">
              <Image 
                src={selectedImage} 
                alt="Enlarged view" 
                fill
                style={{ objectFit: 'contain' }}
                quality={100}
              />
            </div>
            <button
              onClick={closeImage}
              className="mt-4 px-6 py-2 bg-[#3bcf9a] text-black font-medium rounded-md hover:bg-[#2eaf82] transition-colors mx-auto block"
            >
              Go Back
            </button>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <div className={`hidden md:flex w-[180px] flex-shrink-0 min-h-screen fixed left-0 top-0 items-center transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex flex-col items-start w-full py-8">
            {menuItems.map((item) => (
              <div key={item.id} className="mb-12 flex items-center w-full pl-8">
                <div className="inline-block" style={{width: '40px', minWidth: '40px', maxWidth: '40px'}}>
                  <hr style={{
                    width: '40px',
                    height: '2px',
                    backgroundColor: 'white',
                    border: 'none',
                    opacity: 1,
                    margin: 0
                  }} />
                </div>
                <button
                  onClick={() => scrollToSection(item.id)}
                  className={`text-base transition-all duration-200 ml-3 relative z-10 whitespace-nowrap text-gray-300 hover:text-gray-100 hover:translate-x-2 ${
                    activeSection === item.id 
                      ? '' 
                      : ''
                  }`}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Profile Section (Top) */}
        <div className={`md:hidden w-full flex flex-col items-center py-6 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="relative w-[140px] h-[140px] overflow-hidden rounded-full border-2 border-white/10">
            <Image 
              src={aboutData.profileImage || '/default-profile.jpg'} 
              alt="Profile picture" 
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          
          <h1 className="text-3xl font-archivo font-bold mt-4">{aboutData.name}</h1>
          <h2 className="text-lg text-[#3bcf9a] mt-1">{aboutData.designation}</h2>
          
          <div className="flex items-center mt-3 justify-center">
            <div className="flex items-center text-orange-400">
              <span className="inline-flex items-center mr-2">🔸</span>
              {aboutData.location}
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center mt-4 gap-2 px-4 max-w-full">
            {aboutData.languages?.map((language, index) => (
              <button key={index} className="px-2 py-1 border border-white/20 rounded text-xs whitespace-nowrap">{language}</button>
            ))}
          </div>
          
          <div className="flex justify-center mt-5 gap-3">
            {aboutData.links?.github && (
            <a 
                href={aboutData.links.github} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[rgba(23,23,23,0.85)] hover:bg-[rgba(35,35,35,0.95)] px-3 py-1.5 rounded-md transition-colors"
            >
              <FaGithub className="text-white" /> 
            </a>
            )}
            {aboutData.links?.linkedin && (
            <a 
                href={aboutData.links.linkedin} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[rgba(23,23,23,0.85)] hover:bg-[rgba(35,35,35,0.95)] px-3 py-1.5 rounded-md transition-colors"
            >
              <FaLinkedin className="text-white" /> 
            </a>
            )}
            {aboutData.links?.email && (
            <a 
                href={`mailto:${aboutData.links.email}`} 
              className="flex items-center gap-2 bg-[rgba(23,23,23,0.85)] hover:bg-[rgba(35,35,35,0.95)] px-3 py-1.5 rounded-md transition-colors"
            >
              <MdEmail className="text-white" /> 
            </a>
            )}
          </div>
        </div>

        {/* Profile Section (Centered for Desktop) */}
        <div className={`hidden md:flex flex-col items-center w-[220px] pt-[20px] fixed transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ left: 'calc(35% - 110px)' }}>
          <div className="relative w-[180px] h-[180px] overflow-hidden rounded-full border-2 border-white/10">
            <Image 
              src={aboutData.profileImage || '/default-profile.jpg'} 
              alt="Profile picture" 
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          
          <div id="location" className="flex items-center mt-6 justify-center">
            <div className="flex items-center text-orange-400">
              <span className="inline-flex items-center mr-2">🔸</span>
              {aboutData.location}
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center mt-6 gap-2 w-full max-w-[220px]">
            {aboutData.languages?.map((language, index) => (
              <button key={index} className="px-2 py-1 border border-white/20 rounded text-xs whitespace-nowrap">{language}</button>
            ))}
          </div>
        </div>

        {/* Mobile Sidebar Alternative */}
        <div className="md:hidden w-full px-4 py-4">
          <div className="flex overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex gap-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeSection === item.id
                      ? 'bg-[#3bcf9a] text-black'
                      : 'bg-[rgba(23,23,23,0.8)] text-white hover:bg-[rgba(35,35,35,0.9)]'
                  }`}
                  onClick={() => scrollToSection(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className={`flex-1 px-4 py-6 md:pl-0 md:py-10 max-w-full ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`} style={{...contentStyles, marginLeft: isLaptopOrLarger ? contentStyles.marginLeft : '0'}}>
          <div className="transition-opacity duration-1000">
            {/* Profile Section */}
            <section id="introduction" className="mb-16 text-left">
              <div className="space-y-6">
                <div className="hidden md:block">
                  <h1 className="text-4xl md:text-5xl font-archivo font-bold">{aboutData.name}</h1>
                  <h2 className="text-xl text-[#3bcf9a]">{aboutData.designation}</h2>
                </div>
                
                <p className="text-gray-300 leading-relaxed max-w-3xl">
                  {aboutData.introduction}
                </p>
                
                <div className="hidden md:flex flex-wrap gap-4 pt-2 md:mt-8">
                  {aboutData.links?.github && (
                  <a 
                      href={aboutData.links.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[rgba(23,23,23,0.85)] hover:bg-[rgba(35,35,35,0.95)] px-4 py-2 rounded-md transition-colors"
                  >
                    <FaGithub className="text-white" /> 
                    <span>GitHub</span>
                  </a>
                  )}
                  {aboutData.links?.linkedin && (
                  <a 
                      href={aboutData.links.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[rgba(23,23,23,0.85)] hover:bg-[rgba(35,35,35,0.95)] px-4 py-2 rounded-md transition-colors"
                  >
                    <FaLinkedin className="text-white" /> 
                    <span>LinkedIn</span>
                  </a>
                  )}
                  {aboutData.links?.email && (
                  <a 
                      href={`mailto:${aboutData.links.email}`} 
                    className="flex items-center gap-2 bg-[rgba(23,23,23,0.85)] hover:bg-[rgba(35,35,35,0.95)] px-4 py-2 rounded-md transition-colors"
                  >
                    <MdEmail className="text-white" /> 
                    <span>Email</span>
                  </a>
                  )}
                </div>
              </div>
            </section>

            {/* Work Experience */}
            <section id="work-experience" className="mb-16 text-left">
              <div className="relative overflow-hidden mb-8">
                <h2 className="text-2xl md:text-3xl font-archivo font-bold after:content-[''] after:block after:w-16 after:h-1 after:bg-[#3bcf9a] after:mt-2">Work Experience</h2>
              </div>

              <div className="space-y-12">
                {aboutData.experience?.map((exp, index) => (
                  <div key={index} className="space-y-6">
                  <div className="flex flex-col items-start gap-2 md:gap-6">
                      <h3 className="text-xl font-bold text-white">{exp.company}</h3>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-400">{exp.duration}</span>
                      <div className="inline-block bg-[rgba(59,207,154,0.2)] text-[#3bcf9a] text-xs font-semibold px-2 py-1 rounded">
                          {exp.position}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <ul className="list-disc pl-5 space-y-3 text-gray-300">
                        {exp.description?.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                    </ul>
                  </div>

                    {exp.images && exp.images.length > 0 && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {exp.images.map((imageUrl, imgIndex) => (
                    <div 
                            key={imgIndex}
                      className="relative h-[180px] w-full rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => openImage(imageUrl)}
                    >
                      <Image
                              src={imageUrl}
                              alt={`${exp.company} image ${imgIndex + 1}`}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Studies Section */}
            <section id="studies" className="mb-16 text-left">
              <div className="relative overflow-hidden mb-8">
                <h2 className="text-2xl md:text-3xl font-archivo font-bold after:content-[''] after:block after:w-16 after:h-1 after:bg-[#3bcf9a] after:mt-2">Studies</h2>
              </div>

              <div className="space-y-8">
                {aboutData.education?.map((edu, index) => (
                  <div key={index} className="space-y-6">
                  <div>
                      <h3 className="text-xl font-bold text-white mb-2">{edu.institution}</h3>
                      {edu.course && <p className="text-gray-400">{edu.course} ({edu.duration})</p>}
                      <p className="text-gray-400">{edu.department}</p>
                    <div className="flex flex-wrap gap-3 mt-2">
                        {edu.cgpa && <div className="text-[#3bcf9a] font-semibold">CGPA: {edu.cgpa}</div>}
                        {edu.percentage && <div className="text-[#3bcf9a] font-semibold">Percentage: {edu.percentage}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Technical Skills */}
            <section id="technical-skills" className="mb-16 text-left">
              <div className="relative overflow-hidden mb-8">
                <h2 className="text-2xl md:text-3xl font-archivo font-bold after:content-[''] after:block after:w-16 after:h-1 after:bg-[#3bcf9a] after:mt-2">Technical skills</h2>
              </div>
              
              <div className="space-y-10">
                {aboutData.skills?.map((skill, index) => (
                  <div key={index} className="space-y-4">
                    <h3 className="text-xl font-bold text-white">{skill.name}</h3>
                  <p className="text-gray-300">
                      {skill.description}
                  </p>
                    {skill.imageUrl && (
                  <div 
                    className="mt-6 relative h-[200px] w-full rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => openImage(skill.imageUrl!)}
                  >
                    <Image
                          src={skill.imageUrl}
                          alt={skill.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
} 