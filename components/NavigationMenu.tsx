'use client';

import { Stack, IconButton, Button, useMediaQuery, useTheme, Tooltip } from '@mui/material';
import Link from 'next/link';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import AppsIcon from '@mui/icons-material/Apps';
import ArticleIcon from '@mui/icons-material/Article';
import ExtensionIcon from '@mui/icons-material/Extension';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const NavigationMenu = () => {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: isMobile ? 'auto' : '20px',
        bottom: isMobile ? '0' : 'auto',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1300,
        width: isMobile ? '100%' : 'auto',
        padding: isMobile ? '10px' : '0',
      }}
    >
      <Stack
        direction="row"
        spacing={isMobile ? 0 : 2}
        justifyContent={isMobile ? 'space-around' : 'center'}
        sx={{
          px: isMobile ? '5px' : '10px',
          py: isMobile ? '10px' : '2px',
          borderRadius: isMobile ? '25px' : '18px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderBottom: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
          backgroundColor: '#000000',
          background: 'rgba(0, 0, 0, 0.98)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          MozBackdropFilter: 'blur(10px)',
          boxShadow: isMobile ? '0 -4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 30px rgba(0, 0, 0, 0.3)',
          width: isMobile ? '100%' : 'auto',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 'inherit',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: -1,
          }
        }}
      >
        {/* Home Icon Only with Tooltip */}
        <Tooltip title="Home">
          <IconButton
            aria-label="home"
            component={Link}
            href="/"
            sx={{
              bgcolor: pathname === '/'
                ? 'rgba(255, 255, 255, 0.15)'
                : isMobile
                ? 'rgba(0, 0, 0, 0.3)'
                : 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.5)' },
            }}
          >
            <HomeIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* About */}
        {isMobile ? (
          <IconButton
            component={Link}
            href="/about"
            aria-label="about"
            sx={{
              color: 'white',
              bgcolor: pathname === '/about'
                ? 'rgba(255, 255, 255, 0.15)'
                : 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.5)' },
            }}
          >
            <PersonIcon fontSize="small" />
          </IconButton>
        ) : (
          <Button
            component={Link}
            href="/about"
            startIcon={<PersonIcon fontSize="small" />}
            sx={{
              color: 'white',
              textTransform: 'none',
              fontSize: '0.85rem',
              bgcolor: pathname === '/about' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.5)' },
            }}
          >
            About
          </Button>
        )}

        {/* Projects */}
        {isMobile ? (
          <IconButton
            component={Link}
            href="/projects"
            aria-label="projects"
            sx={{
              color: 'white',
              bgcolor: pathname === '/projects'
                ? 'rgba(255, 255, 255, 0.15)'
                : 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.5)' },
            }}
          >
            <AppsIcon fontSize="small" />
          </IconButton>
        ) : (
          <Button
            component={Link}
            href="/projects"
            startIcon={<AppsIcon fontSize="small" />}
            sx={{
              color: 'white',
              textTransform: 'none',
              fontSize: '0.85rem',
              bgcolor: pathname === '/projects' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.5)' },
            }}
          >
            Projects
          </Button>
        )}

        {/* Blog */}
        {isMobile ? (
          <IconButton
            component={Link}
            href="/blog"
            aria-label="blog"
            sx={{
              color: 'white',
              bgcolor: pathname === '/blog' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.5)' },
            }}
          >
            <ArticleIcon fontSize="small" />
          </IconButton>
        ) : (
          <Button
            component={Link}
            href="/blog"
            startIcon={<ArticleIcon fontSize="small" />}
            sx={{
              color: 'white',
              textTransform: 'none',
              fontSize: '0.85rem',
              bgcolor: pathname === '/blog' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.5)' },
            }}
          >
            Blog
          </Button>
        )}

        {/* Resources */}
        {isMobile ? (
          <IconButton
            component={Link}
            href="/resources"
            aria-label="resources"
            sx={{
              color: 'white',
              bgcolor: pathname === '/resources'
                ? 'rgba(255, 255, 255, 0.15)'
                : 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.5)' },
            }}
          >
            <ExtensionIcon fontSize="small" />
          </IconButton>
        ) : (
          <Button
            component={Link}
            href="/resources"
            startIcon={<ExtensionIcon fontSize="small" />}
            sx={{
              color: 'white',
              textTransform: 'none',
              fontSize: '0.85rem',
              bgcolor: pathname === '/resources' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.5)' },
            }}
          >
            Resources
          </Button>
        )}
      </Stack>
    </div>
  );
};

export default NavigationMenu;
