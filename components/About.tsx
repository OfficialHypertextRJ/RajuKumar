'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { MdEmail, MdLocationOn, MdLanguage } from 'react-icons/md';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    const fetchAboutData = async () => {
      try {
        const response = await fetch('/api/about');
        
        if (!response.ok) {
          throw new Error('Failed to fetch about data');
        }
        
        const data = await response.json();
        setAboutData(data);
      } catch (error) {
        console.error('Error fetching about data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
    return () => clearTimeout(timer);
  }, []);

  if (loading || !aboutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3bcf9a]"></div>
      </div>
    );
  }

  return (
    <div className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Profile Section */}
      <section id="introduction" className="mb-16">
        <div className="flex flex-col gap-8">
          {/* Profile Image & Info in a grid */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Profile Image */}
            <div className="md:w-[180px] flex-shrink-0">
              <div className="relative w-[180px] h-[180px] overflow-hidden rounded-full border-2 border-white/10">
                <Image 
                  src={aboutData.profileImage || '/default-profile.jpg'} 
                  alt="Profile picture" 
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-archivo font-bold mb-2">{aboutData.name}</h1>
              <p className="text-2xl text-[#3bcf9a] mb-3">{aboutData.designation}</p>
              
              <div className="flex flex-wrap gap-4 items-center text-gray-400 mb-4">
                {aboutData.location && (
                  <div className="flex items-center gap-1">
                    <MdLocationOn className="text-[#3bcf9a]" />
                    <span>{aboutData.location}</span>
              </div>
                )}
                {aboutData.languages?.length > 0 && (
                  <div className="flex items-center gap-1">
                    <MdLanguage className="text-[#3bcf9a]" />
                    <span>{aboutData.languages.join(', ')}</span>
                </div>
                )}
              </div>
              
              <div className="relative overflow-hidden">
                <p className="text-gray-300 leading-relaxed mb-4">
                  {aboutData.introduction}
                </p>
                <div 
                  className={`absolute top-0 left-0 w-full h-full bg-[#0d0d0d] transform transition-all duration-1600 ease-in-out delay-600 ${isVisible ? 'translate-x-full' : 'translate-x-0'} after:absolute after:top-0 after:right-0 after:w-[2px] after:h-full after:bg-[#38B2AC] after:opacity-100`}
                ></div>
              </div>

              {/* Social Links */}
              {aboutData.links && (
                <div className="flex gap-4 mt-4">
                  {aboutData.links.github && (
                    <a 
                      href={aboutData.links.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-[#3bcf9a] transition-colors"
                    >
                      <FaGithub size={24} />
                    </a>
                  )}
                  {aboutData.links.linkedin && (
                    <a 
                      href={aboutData.links.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-[#3bcf9a] transition-colors"
                    >
                      <FaLinkedin size={24} />
                    </a>
                  )}
                  {aboutData.links.email && (
                    <a 
                      href={`mailto:${aboutData.links.email}`} 
                      className="text-gray-400 hover:text-[#3bcf9a] transition-colors"
                    >
                      <MdEmail size={24} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Work Experience */}
      <section id="work-experience" className="mb-16">
        <div className="relative overflow-hidden mb-10">
          <h2 className="text-2xl md:text-3xl font-archivo font-bold after:content-[''] after:block after:w-16 after:h-1 after:bg-[#3bcf9a] after:mt-2">Work Experience</h2>
          <div 
            className={`absolute top-0 left-0 w-full h-full bg-[#0d0d0d] transform transition-all duration-1600 ease-in-out delay-800 ${isVisible ? 'translate-x-full' : 'translate-x-0'} after:absolute after:top-0 after:right-0 after:w-[2px] after:h-full after:bg-[#38B2AC] after:opacity-100`}
          ></div>
        </div>
        
        <div className="space-y-12">
          {aboutData.experience?.map((exp, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6">
            <div>
                <h3 className="text-xl font-bold text-white mb-1">{exp.company}</h3>
              <div className="inline-block bg-[rgba(59,207,154,0.2)] text-[#3bcf9a] text-xs font-semibold px-2 py-1 rounded mb-3">
                  {exp.position}
              </div>
                <p className="text-gray-400">{exp.duration}</p>
            </div>
            
            <div className="space-y-4">
              <ul className="list-disc pl-5 space-y-3 text-gray-300">
                  {exp.description?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
              </ul>
              
                {/* Experience Images */}
                {exp.images && exp.images.length > 0 && (
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {exp.images.map((imageUrl, imgIndex) => (
                      <div key={imgIndex} className="rounded-md overflow-hidden border border-white/10">
                  <Image 
                          src={imageUrl}
                          alt={`${exp.company} image ${imgIndex + 1}`}
                          width={400}
                          height={250}
                    className="w-full h-auto"
                  />
                </div>
                    ))}
                </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Studies Section */}
      <section id="studies" className="mb-16">
        <div className="relative overflow-hidden mb-10">
          <h2 className="text-2xl md:text-3xl font-archivo font-bold after:content-[''] after:block after:w-16 after:h-1 after:bg-[#3bcf9a] after:mt-2">Studies</h2>
          <div 
            className={`absolute top-0 left-0 w-full h-full bg-[#0d0d0d] transform transition-all duration-1600 ease-in-out delay-1000 ${isVisible ? 'translate-x-full' : 'translate-x-0'} after:absolute after:top-0 after:right-0 after:w-[2px] after:h-full after:bg-[#38B2AC] after:opacity-100`}
          ></div>
        </div>
        
        <div className="space-y-8">
          {aboutData.education?.map((edu, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6">
            <div>
                <h3 className="text-xl font-bold text-white mb-1">{edu.institution}</h3>
                {edu.course && <p className="text-gray-400">{edu.course}</p>}
                <p className="text-gray-400">{edu.department}</p>
                <p className="text-gray-400 mt-1">{edu.duration}</p>
                
                <div className="mt-2 space-y-1">
                  {edu.cgpa && (
                    <div className="text-[#3bcf9a] font-semibold">CGPA: {edu.cgpa}</div>
                  )}
                  {edu.percentage && (
                    <div className="text-[#3bcf9a] font-semibold">Percentage: {edu.percentage}</div>
                  )}
                </div>
                </div>
                
              <div>
                <p className="text-gray-300">{edu.department}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Technical Skills */}
      <section id="technical-skills">
        <div className="relative overflow-hidden mb-10">
          <h2 className="text-2xl md:text-3xl font-archivo font-bold after:content-[''] after:block after:w-16 after:h-1 after:bg-[#3bcf9a] after:mt-2">Technical Skills</h2>
          <div 
            className={`absolute top-0 left-0 w-full h-full bg-[#0d0d0d] transform transition-all duration-1600 ease-in-out delay-1200 ${isVisible ? 'translate-x-full' : 'translate-x-0'} after:absolute after:top-0 after:right-0 after:w-[2px] after:h-full after:bg-[#38B2AC] after:opacity-100`}
          ></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {aboutData.skills?.map((skill, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center gap-4">
                {skill.imageUrl && (
                  <div className="w-12 h-12 relative overflow-hidden rounded-md">
                  <Image 
                      src={skill.imageUrl}
                      alt={skill.name}
                      width={48}
                      height={48}
                      className="object-contain"
                  />
                </div>
                )}
                <h3 className="text-xl font-bold text-white">{skill.name}</h3>
              </div>
            
              <p className="text-gray-300">{skill.description}</p>
            </div>
          ))}
        </div>
      </section>
      </div>
  );
};

export default About; 