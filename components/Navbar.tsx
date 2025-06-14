'use client';

import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button, 
  IconButton,
  Container,
  Stack
} from '@mui/material';
import Link from 'next/link';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import AppsIcon from '@mui/icons-material/Apps';
import ArticleIcon from '@mui/icons-material/Article';
import ImageIcon from '@mui/icons-material/Image';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();
  
  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        background: 'transparent',
        backdropFilter: 'blur(0.5px)',
        pt: 1,
        pb: 1,
        zIndex: 1200
      }}
    >
      <Container 
        maxWidth="xl" 
        sx={{ 
          background: 'transparent',
          borderRadius: 1
        }}
      >
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Typography 
            variant="body2" 
            noWrap
            sx={{ 
              fontWeight: 500,
              background: 'transparent',
              whiteSpace: 'nowrap',
              minWidth: { xs: '90px', sm: 'auto' }
            }}
          >
            Raju Kumar
          </Typography>
          
          {/* Navigation moved outside the Navbar */}
          <div style={{ width: '30%' }}></div>
          
          <Button
            component="a"
            href="/contact"
            target="_self"
            rel="noopener noreferrer"
            startIcon={<ConnectWithoutContactIcon  />}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              textTransform: 'none',
              fontSize: { xs: '0.75rem', sm: '0.85rem' },
              padding: { xs: '4px', sm: '6px' },
              minWidth: { xs: 'auto', sm: '80px' },
              background: 'transparent',
              '&:hover': { 
                bgcolor: 'transparent',
                color: 'white'
              }
            }}
          >
            Contact
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 