'use client';

import { useState, useEffect } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';

interface SidebarItem {
  id: string;
  label: string;
}

const AboutSidebar = () => {
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const menuItems: SidebarItem[] = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'work-experience', label: 'Work Experience' },
    { id: 'studies', label: 'Studies' },
    { id: 'technical-skills', label: 'Technical skills' },
    { id: 'location', label: 'New Delhi, India' },
  ];

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const yOffset = -100; // Adjust for header height
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  // Track scroll position to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = menuItems.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 150; // Adjusted offset

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(menuItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuItems]);

  if (isMobile) {
    return (
      <div className="flex overflow-x-auto py-2 mb-6 hide-scrollbar">
        <div className="flex gap-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-all ${
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
    );
  }

  return (
    <div className="sticky top-28">
      <h3 className="text-[#3bcf9a] text-sm uppercase tracking-wider font-medium mb-6">Navigation</h3>
      <nav className="flex flex-col">
        {menuItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(item.id);
            }}
            className={`text-base py-2.5 transition-all duration-200 border-l-2 pl-4 mb-1 ${
              activeSection === item.id 
                ? 'border-[#3bcf9a] text-white font-medium' 
                : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300'
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
};

export default AboutSidebar; 