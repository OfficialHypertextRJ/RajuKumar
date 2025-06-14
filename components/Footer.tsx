'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Link as MuiLink } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { fetchFooterContent } from '@/lib/fetchContent';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

interface FooterContent {
  copyright: string;
  email: string;
  phone?: string;
  location?: string;
  socialLinks: SocialLink[];
  _timestamp?: number;
}

const defaultContent: FooterContent = {
  copyright: `© ${new Date().getFullYear()} / Raju Kumar`,
  email: 'your.email@example.com',
  socialLinks: [
    {
      id: '1',
      platform: 'GitHub',
      url: 'https://github.com/yourusername',
      icon: 'GitHubIcon'
    },
    {
      id: '2',
      platform: 'LinkedIn',
      url: 'https://linkedin.com/in/yourusername',
      icon: 'LinkedInIcon'
    },
    {
      id: '3',
      platform: 'Email',
      url: 'mailto:your.email@example.com',
      icon: 'EmailIcon'
    }
  ]
};

const Footer = () => {
  const [content, setContent] = useState<FooterContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [timestamp, setTimestamp] = useState(Date.now());
  
  useEffect(() => {
    const loadFooterContent = async () => {
      try {
        const footerContent = await fetchFooterContent();
        if (footerContent) {
          setContent({
            copyright: footerContent.copyright || defaultContent.copyright,
            email: footerContent.email || defaultContent.email,
            phone: footerContent.phone || defaultContent.phone,
            location: footerContent.location || defaultContent.location,
            socialLinks: footerContent.socialLinks || defaultContent.socialLinks,
            _timestamp: footerContent._timestamp || Date.now()
          });
        }
      } catch (error) {
        console.error('Error loading footer content:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFooterContent();
    
    // Set up an interval to refresh the footer content every 60 seconds
    const intervalId = setInterval(() => {
      setTimestamp(Date.now());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [timestamp]);
  
  // Get the appropriate icon component based on the icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'GitHubIcon':
        return <GitHubIcon fontSize="small" />;
      case 'LinkedInIcon':
        return <LinkedInIcon fontSize="small" />;
      case 'EmailIcon':
        return <EmailIcon fontSize="small" />;
      case 'TwitterIcon':
        return <TwitterIcon fontSize="small" />;
      case 'InstagramIcon':
        return <InstagramIcon fontSize="small" />;
      case 'FacebookIcon':
        return <FacebookIcon fontSize="small" />;
      case 'YouTubeIcon':
        return <YouTubeIcon fontSize="small" />;
      default:
        return <EmailIcon fontSize="small" />;
    }
  };
  
  // Don't render until content is loaded
  if (loading) {
    return null;
  }
  
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 4,
        pb: { xs: 20, sm: 4 }, // Add extra padding at bottom on mobile for the navigation menu
        bgcolor: 'transparent',
        position: 'relative',
        zIndex: 1000 // Lower than the navigation menu (1300)
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 2, md: 0 } }}>
            {content.copyright}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {content.socialLinks.map((link) => (
              <MuiLink 
                key={link.id}
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                color="inherit"
                sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                title={link.platform}
              >
                {getIconComponent(link.icon)}
              </MuiLink>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 