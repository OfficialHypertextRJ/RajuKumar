'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { fetchFooterContent } from '@/lib/fetchContent';

interface ContactInfoData {
  email: string;
  phone?: string;
  location?: string;
  _timestamp?: number;
}

const defaultContactInfo: ContactInfoData = {
  email: 'your.email@example.com',
  phone: '+91 123-456-7890',
  location: 'Delhi, India',
};

const ContactInfo = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfoData>(defaultContactInfo);
  const [loading, setLoading] = useState(true);
  const [timestamp, setTimestamp] = useState(Date.now());

  useEffect(() => {
    const loadContactInfo = async () => {
      try {
        const footerContent = await fetchFooterContent();
        if (footerContent) {
          setContactInfo({
            email: footerContent.email || defaultContactInfo.email,
            phone: footerContent.phone || defaultContactInfo.phone,
            location: footerContent.location || defaultContactInfo.location,
            _timestamp: footerContent._timestamp
          });
        }
      } catch (error) {
        console.error('Error loading contact info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContactInfo();
    
    // Set up an interval to refresh the contact info every 60 seconds
    const intervalId = setInterval(() => {
      setTimestamp(Date.now());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [timestamp]);

  if (loading) {
    return null;
  }

  const contactItems = [
    {
      icon: <FiMail className="text-xl text-[#3bcf9a]" />,
      title: 'Email',
      content: contactInfo.email,
      link: `mailto:${contactInfo.email}`,
    },
    {
      icon: <FiPhone className="text-xl text-[#3bcf9a]" />,
      title: 'Phone',
      content: contactInfo.phone,
      link: `tel:${contactInfo.phone?.replace(/[^0-9+]/g, '')}`,
    },
    {
      icon: <FiMapPin className="text-xl text-[#3bcf9a]" />,
      title: 'Location',
      content: contactInfo.location,
      link: `https://maps.google.com/?q=${encodeURIComponent(contactInfo.location || '')}`,
    },
  ];

  return (
    <section className="py-16 px-4 bg-[#0d0d0d]/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-10"
        >
          <h2 className="text-3xl font-bold font-archivo mb-4">Contact Information</h2>
          <div className="w-16 h-1 bg-[#3bcf9a] mx-auto mb-6"></div>
          <p className="text-gray-400">
            Feel free to reach out if you have any questions or opportunities!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {contactItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
              viewport={{ once: true }}
              className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800 flex flex-col items-center text-center"
            >
              <div className="bg-[#3bcf9a]/10 p-4 rounded-full mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <a
                href={item.link}
                target={item.title === 'Location' ? '_blank' : undefined}
                rel={item.title === 'Location' ? 'noopener noreferrer' : undefined}
                className="text-gray-400 hover:text-[#3bcf9a] transition-colors"
              >
                {item.content}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactInfo; 