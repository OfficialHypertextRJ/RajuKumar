'use client';

import Navbar from '@/components/Navbar';
import NavigationMenu from '@/components/NavigationMenu';
import Footer from '@/components/Footer';
import ConnectWithMe from '@/components/ConnectWithMe';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiExternalLink } from 'react-icons/fi';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoadingSpinner from '@/components/LoadingSpinner';

// Resource section type
interface ResourceSection {
  id: string;
  name: string;
  title?: string;
  description: string;
}

// Resource item type
interface ResourceItem {
  id: string;
  title: string;
  description: string;
  link: string;
  image: string;
  category?: string;
}

// Category type from Firestore
interface FirestoreCategory {
  id: string;
  name: string;
  title?: string;
  description: string;
  order: number;
  items: ResourceItem[];
}

export default function ResourcesPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<ResourceSection[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);

  // Fetch resource categories from Firestore
  useEffect(() => {
    const fetchResourceCategories = async () => {
      try {
        const categoriesRef = collection(db, 'resourceCategories');
        const q = query(categoriesRef, orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        
        const sectionsList: ResourceSection[] = [];
        const resourcesList: ResourceItem[] = [];
        
        console.log("Fetched categories:", querySnapshot.size);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data() as FirestoreCategory;
          console.log("Category data:", doc.id, data);
          
          // Add section - handle both name and title fields
          sectionsList.push({
            id: doc.id,
            name: data.name || data.title || '',
            title: data.name || data.title || '',
            description: data.description || ''
          });
          
          // Add resources with category ID
          if (data.items && Array.isArray(data.items)) {
            data.items.forEach(item => {
              resourcesList.push({
                ...item,
                category: doc.id // Set the category to the document ID
              });
            });
          }
        });
        
        console.log("Processed sections:", sectionsList);
        console.log("Processed resources:", resourcesList);
        
        setSections(sectionsList);
        setResources(resourcesList);
        
        // Set first section as active if we have sections
        if (sectionsList.length > 0) {
          setActiveSection(sectionsList[0].id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching resource categories:', error);
        setLoading(false);
      }
    };
    
    fetchResourceCategories();
  }, []);

  // Filter resources by active section
  const filteredResources = resources.filter(resource => resource.category === activeSection);

  // Add fallback for empty sections
  useEffect(() => {
    if (sections.length === 0 && !loading) {
      // Create a demo section if no categories exist
      const demoSection: ResourceSection = {
        id: 'demo-section',
        name: 'Demo Resources',
        title: 'Demo Resources',
        description: 'This is a demo section. Add real categories in the admin panel.'
      };
      
      const demoResources: ResourceItem[] = [
        {
          id: 'demo-resource-1',
          title: 'Demo Resource',
          description: 'This is a demo resource. Add real resources in the admin panel.',
          link: '#',
          image: 'https://storage.googleapis.com/a1aa/image/react-logo.png',
          category: 'demo-section'
        }
      ];
      
      setSections([demoSection]);
      setResources(demoResources);
      setActiveSection('demo-section');
      
      console.log("Created demo section and resources");
    }
  }, [sections, loading]);

  useEffect(() => {
    // Make content visible with a short delay on mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Function to handle section click
  const handleSectionClick = (sectionId: string) => {
    if (isMobile) {
      // On mobile: toggle section (close if already open, open if closed)
      setActiveSection(prevActive => prevActive === sectionId ? '' : sectionId);
    } else {
      // On desktop: just set active section
      setActiveSection(sectionId);
    }
  };

  // Component to display each resource card
  const ResourceCard = ({ resource }: { resource: ResourceItem }) => {
    return (
      <div className="bg-[#0d0d0d] rounded-lg overflow-hidden transition-transform hover:translate-y-[-4px] h-full">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 relative mr-4 bg-[rgba(255,255,255,0.05)] rounded-lg flex items-center justify-center">
              <Image 
                src={resource.image}
                alt={resource.title}
                width={32}
                height={32}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <h3 className="text-xl font-bold text-white">{resource.title}</h3>
          </div>
          
          <p className="text-gray-400 text-sm mb-4 flex-grow">{resource.description}</p>
          
          <a 
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-[#3bcf9a] text-sm font-medium hover:underline mt-auto"
          >
            Visit Resource
            <FiExternalLink className="ml-2" />
          </a>
        </div>
      </div>
    );
  };

  // Component for section headers
  const ResourceSectionHeader = ({ section, isActive }: { section: ResourceSection, isActive: boolean }) => {
    // Use name or title, whichever is available
    const displayName = section.name || section.title || '';
    
    return (
      <button
        onClick={() => handleSectionClick(section.id)}
        className={`w-full px-4 py-3 rounded-lg text-left transition-colors ${
          isActive 
            ? 'bg-[#3bcf9a] text-black' 
            : 'bg-[rgba(23,23,23,0.8)] text-white hover:bg-[rgba(35,35,35,0.9)]'
        }`}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">{displayName}</h3>
            <p className={`text-sm mt-1 ${isActive ? 'text-black/80' : 'text-gray-400'}`}>{section.description}</p>
          </div>
          {isMobile && (
            <div className="ml-2">
              {isActive ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </div>
          )}
        </div>
      </button>
    );
  };

  // Mobile accordion section
  const MobileAccordionSection = ({ section }: { section: ResourceSection }) => {
    const isActive = activeSection === section.id;
    const sectionResources = resources.filter(resource => resource.category === section.id);
    
    return (
      <div className="mb-6">
        <ResourceSectionHeader section={section} isActive={isActive} />
        
        {isActive && (
          <div className="mt-4 grid grid-cols-1 gap-4 animate-fadeIn">
            {sectionResources.map((resource, index) => (
              <ResourceCard key={`${resource.category}-${index}`} resource={resource} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <NavigationMenu />
      <div className="h-[70px] sm:h-0" aria-hidden="true"></div>
      
      <main className={`flex-1 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner />
            </div>
          ) : (
            <>
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-archivo font-bold">Resources & Tools</h1>
            <div className="w-16 h-1 bg-[#3bcf9a] mt-3 mx-auto"></div>
            <p className="mt-6 text-gray-300 max-w-3xl mx-auto">
              A curated collection of tools, extensions, and resources I use daily and recommend to fellow developers.
              These have significantly improved my workflow and might help you too.
            </p>
          </div>
          
          {/* Desktop Layout */}
          <div className={`${isMobile ? 'hidden' : 'grid'} grid-cols-1 lg:grid-cols-4 gap-8`}>
            {/* Section Navigation Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-3 sticky top-24">
                {sections.map(section => (
                  <ResourceSectionHeader 
                    key={section.id} 
                    section={section} 
                    isActive={activeSection === section.id} 
                  />
                ))}
              </div>
            </div>
            
            {/* Resource Cards */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource, index) => (
                  <ResourceCard key={`${resource.category}-${index}`} resource={resource} />
                ))}
              </div>
            </div>
          </div>
          
          {/* Mobile Accordion Layout */}
          <div className={`${isMobile ? 'block' : 'hidden'}`}>
            {sections.map(section => (
              <MobileAccordionSection key={section.id} section={section} />
            ))}
          </div>
          
          {/* Call to action */}
          <div className="mt-16 bg-[#0d0d0d] rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Missing Something?</h2>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              If you have suggestions for resources I should check out or if you'd like to discuss any of these tools in more detail, 
              I'd love to hear from you.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 bg-[#3bcf9a] text-black font-medium rounded-md hover:bg-[#2eaf82] transition-colors"
            >
              Get in Touch
            </Link>
          </div>
            </>
          )}
        </div>
      </main>
      
      <ConnectWithMe />
      <Footer />
    </div>
  );
} 