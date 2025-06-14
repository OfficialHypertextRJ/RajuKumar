'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import NavigationMenu from '@/components/NavigationMenu';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiSend, FiGithub, FiLinkedin, FiTwitter, FiInstagram, FiFacebook, FiYoutube, FiLink } from 'react-icons/fi';
import emailjs from 'emailjs-com';
import toast from 'react-hot-toast';
import { fetchFooterContent } from '@/lib/fetchContent';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

export default function ContactPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timestamp, setTimestamp] = useState(Date.now());
  const [contactInfo, setContactInfo] = useState([
    {
      icon: <FiMail className="text-xl text-[#3bcf9a]" />,
      title: 'Email',
      content: 'loading...',
      link: '#',
    },
    {
      icon: <FiPhone className="text-xl text-[#3bcf9a]" />,
      title: 'Phone',
      content: 'loading...',
      link: '#',
    },
    {
      icon: <FiMapPin className="text-xl text-[#3bcf9a]" />,
      title: 'Location',
      content: 'loading...',
      link: '#',
    },
  ]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  
  // Replace with your EmailJS details
  const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID2 || '';
  const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID2 || '';
  const EMAILJS_USER_ID = process.env.NEXT_PUBLIC_EMAILJS_USER_ID2 || 'sfYc0NFoR8c9Nq6kV';
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Fetch contact info from footer content
    const loadContactInfo = async () => {
      try {
        const footerContent = await fetchFooterContent();
        if (footerContent) {
          const email = footerContent.email || 'your.email@example.com';
          const phone = footerContent.phone || '+91 123-456-7890';
          const location = footerContent.location || 'Delhi, India';
          
          setContactInfo([
            {
              icon: <FiMail className="text-xl text-[#3bcf9a]" />,
              title: 'Email',
              content: email,
              link: `mailto:${email}`,
            },
            {
              icon: <FiPhone className="text-xl text-[#3bcf9a]" />,
              title: 'Phone',
              content: phone,
              link: `tel:${phone.replace(/[^0-9+]/g, '')}`,
            },
            {
              icon: <FiMapPin className="text-xl text-[#3bcf9a]" />,
              title: 'Location',
              content: location,
              link: `https://maps.google.com/?q=${encodeURIComponent(location)}`,
            },
          ]);
          
          // Set social links from footer content
          if (footerContent.socialLinks && footerContent.socialLinks.length > 0) {
            setSocialLinks(footerContent.socialLinks);
          }
        }
      } catch (error) {
        console.error('Error loading contact info:', error);
      }
    };
    
    loadContactInfo();
    
    // Set up an interval to refresh the contact info every 60 seconds
    const intervalId = setInterval(() => {
      setTimestamp(Date.now());
    }, 60000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(intervalId);
    };
  }, [timestamp]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        from_name: formData.name,
        reply_to: formData.email,
        subject: formData.subject,
        message: formData.message,
      },
      EMAILJS_USER_ID
    )
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        toast.success('Message sent successfully!');
        setIsSubmitting(false);
        
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        });
      })
      .catch((err) => {
        console.log('FAILED...', err);
        toast.error('Failed to send message. Please try again.');
        setIsSubmitting(false);
      });
  };
  
  // Helper function to get icon component for social links
  const getSocialIcon = (iconName: string) => {
    switch (iconName) {
      case 'GitHubIcon':
        return <FiGithub size={18} />;
      case 'LinkedInIcon':
        return <FiLinkedin size={18} />;
      case 'TwitterIcon':
        return <FiTwitter size={18} />;
      case 'InstagramIcon':
        return <FiInstagram size={18} />;
      case 'FacebookIcon':
        return <FiFacebook size={18} />;
      case 'YouTubeIcon':
        return <FiYoutube size={18} />;
      default:
        return <FiLink size={18} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <NavigationMenu />
      <div className="h-[70px] sm:h-0" aria-hidden="true"></div>
      
      <main className={`flex-1 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-archivo font-bold">Get In Touch</h1>
            <div className="w-16 h-1 bg-[#3bcf9a] mt-3 mx-auto"></div>
            <p className="mt-6 text-gray-300 max-w-3xl mx-auto">
              Have a question or want to work together? Feel free to reach out using the form below.
              I'm always open to discussing new projects, creative ideas or opportunities to be part of your vision.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <div className="bg-[#0d0d0d] rounded-lg p-8 border border-gray-800">
                <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <motion.div
                      key={info.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start"
                    >
                      <div className="bg-[#1a1a1a] p-3 rounded-full mr-4">
                        {info.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-1">{info.title}</h4>
                        <a 
                          href={info.link}
                          className="text-gray-400 hover:text-[#3bcf9a] transition-colors"
                        >
                          {info.content}
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-8 pt-8 border-t border-gray-800">
                  <h4 className="text-lg font-medium mb-4">Follow Me</h4>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((link, index) => (
                      <motion.a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1a1a1a] text-gray-400 hover:text-[#3bcf9a] transition-colors"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 + 0.3 }}
                        title={link.platform}
                      >
                        {getSocialIcon(link.icon)}
                      </motion.a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <div className="bg-[#0d0d0d] rounded-lg p-8 border border-gray-800">
                <h3 className="text-xl font-semibold mb-6">Send Me a Message</h3>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3bcf9a] focus:border-transparent bg-[#1a1a1a] text-white"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Your Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3bcf9a] focus:border-transparent bg-[#1a1a1a] text-white"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3bcf9a] focus:border-transparent bg-[#1a1a1a] text-white"
                      placeholder="Project Inquiry"
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3bcf9a] focus:border-transparent bg-[#1a1a1a] text-white"
                      placeholder="Your message here..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-black bg-[#3bcf9a] hover:bg-[#34b88a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3bcf9a]"
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        Send Message <FiSend className="ml-2" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 