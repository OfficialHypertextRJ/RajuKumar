'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminContentLayout from '@/components/AdminContentLayout';
import AdminFormField from '@/components/AdminFormField';
import AdminSubmitButton from '@/components/AdminSubmitButton';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Button, 
  IconButton, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

interface FooterData {
  copyright: string;
  email: string;
  phone: string;
  location: string;
  socialLinks: SocialLink[];
}

const FooterAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [footerData, setFooterData] = useState<FooterData>({
    copyright: '',
    email: '',
    phone: '',
    location: '',
    socialLinks: []
  });
  
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [deleteLinkDialogOpen, setDeleteLinkDialogOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState<SocialLink | null>(null);
  const [linkFormData, setLinkFormData] = useState({
    platform: '',
    url: '',
    icon: ''
  });

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      const footerDocRef = doc(db, 'content', 'footer');
      const footerDoc = await getDoc(footerDocRef);
      
      if (footerDoc.exists()) {
        const data = footerDoc.data() as FooterData;
        setFooterData({
          copyright: data.copyright || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          socialLinks: data.socialLinks || []
        });
      } else {
        // Create the document if it doesn't exist
        const initialData = {
          copyright: `© ${new Date().getFullYear()} / Your Name`,
          email: 'your.email@example.com',
          phone: '+91 123-456-7890',
          location: 'Delhi, India',
          socialLinks: [],
          createdAt: serverTimestamp()
        };
        await setDoc(footerDocRef, initialData);
        setFooterData(initialData);
      }
    } catch (error) {
      console.error('Error fetching footer data:', error);
      toast.error('Failed to load footer data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFooterData(prev => ({ ...prev, [id]: value }));
  };

  const handleLinkInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setLinkFormData(prev => ({ ...prev, [id]: value }));
  };

  const openAddLinkDialog = () => {
    setCurrentLink(null);
    setLinkFormData({
      platform: '',
      url: '',
      icon: ''
    });
    setLinkDialogOpen(true);
  };

  const openEditLinkDialog = (link: SocialLink) => {
    setCurrentLink(link);
    setLinkFormData({
      platform: link.platform || '',
      url: link.url || '',
      icon: link.icon || ''
    });
    setLinkDialogOpen(true);
  };

  const openDeleteLinkDialog = (link: SocialLink) => {
    setCurrentLink(link);
    setDeleteLinkDialogOpen(true);
  };

  const handleDeleteLink = () => {
    if (!currentLink) return;
    
    const updatedLinks = footerData.socialLinks.filter(link => link.id !== currentLink.id);
    setFooterData(prev => ({ ...prev, socialLinks: updatedLinks }));
    setDeleteLinkDialogOpen(false);
    setCurrentLink(null);
    toast.success('Social link removed');
  };

  const handleSubmitLink = () => {
    if (!linkFormData.platform || !linkFormData.url) {
      toast.error('Platform and URL are required');
      return;
    }
    
    let updatedLinks: SocialLink[];
    
    if (currentLink) {
      // Update existing link
      updatedLinks = footerData.socialLinks.map(link => 
        link.id === currentLink.id 
          ? { ...link, ...linkFormData } 
          : link
      );
    } else {
      // Add new link
      const newLink: SocialLink = {
        ...linkFormData,
        id: `link-${Date.now()}`
      };
      updatedLinks = [...footerData.socialLinks, newLink];
    }
    
    setFooterData(prev => ({ ...prev, socialLinks: updatedLinks }));
    setLinkDialogOpen(false);
    toast.success(currentLink ? 'Social link updated' : 'Social link added');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const footerDocRef = doc(db, 'content', 'footer');
      
      await updateDoc(footerDocRef, {
        ...footerData,
        updatedAt: serverTimestamp()
      });
      
      // Call the revalidation API to clear the cache
      await fetch('/api/footer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      toast.success('Footer information updated successfully');
    } catch (error) {
      console.error('Error updating footer information:', error);
      toast.error('Failed to update footer information');
    } finally {
      setSaving(false);
    }
  };

  // Helper function to get icon name from URL
  const getPlatformIcon = (platform: string): string => {
    const platformLower = platform.toLowerCase();
    
    if (platformLower.includes('github')) return 'GitHubIcon';
    if (platformLower.includes('linkedin')) return 'LinkedInIcon';
    if (platformLower.includes('twitter') || platformLower.includes('x.com')) return 'TwitterIcon';
    if (platformLower.includes('instagram')) return 'InstagramIcon';
    if (platformLower.includes('facebook')) return 'FacebookIcon';
    if (platformLower.includes('youtube')) return 'YouTubeIcon';
    if (platformLower.includes('medium')) return 'BookIcon';
    if (platformLower.includes('dribbble')) return 'SportsBasketballIcon';
    if (platformLower.includes('behance')) return 'WebIcon';
    
    return 'LinkIcon'; // Default icon
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AdminContentLayout title="Footer">
          <LoadingSpinner />
        </AdminContentLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminContentLayout title="Footer">
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <AdminFormField
                  label="Copyright Text"
                  id="copyright"
                  value={footerData.copyright}
                  onChange={handleInputChange}
                  placeholder="© 2023 / Your Name"
                />
              </Grid>
              
              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <AdminFormField
                  label="Contact Email"
                  id="email"
                  value={footerData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                />
              </Grid>

              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <AdminFormField
                  label="Phone Number"
                  id="phone"
                  value={footerData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 123-456-7890"
                />
              </Grid>
              
              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <AdminFormField
                  label="Location"
                  id="location"
                  value={footerData.location}
                  onChange={handleInputChange}
                  placeholder="Delhi, India"
                />
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Social Links
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={openAddLinkDialog}
              >
                Add Social Link
              </Button>
            </Box>
            
            {footerData.socialLinks.length > 0 ? (
              <List>
                {footerData.socialLinks.map((link) => (
                  <React.Fragment key={link.id}>
                    <ListItem>
                      <ListItemText
                        primary={link.platform}
                        secondary={link.url}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          aria-label="edit"
                          onClick={() => openEditLinkDialog(link)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          color="error"
                          onClick={() => openDeleteLinkDialog(link)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No social links added yet. Click the "Add Social Link" button to add your first link.
                </Typography>
              </Box>
            )}
          </Paper>
          
          <AdminSubmitButton
            saving={saving}
            label="Save Footer Information"
          />
        </Box>
        
        {/* Add/Edit Social Link Dialog */}
        <Dialog 
          open={linkDialogOpen} 
          onClose={() => setLinkDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {currentLink ? 'Edit Social Link' : 'Add Social Link'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid sx={{ gridColumn: 'span 12' }}>
                  <AdminFormField
                    label="Platform Name"
                    id="platform"
                    value={linkFormData.platform}
                    onChange={handleLinkInputChange}
                    required
                    placeholder="GitHub, LinkedIn, Twitter, etc."
                  />
                </Grid>
                
                <Grid sx={{ gridColumn: 'span 12' }}>
                  <AdminFormField
                    label="URL"
                    id="url"
                    value={linkFormData.url}
                    onChange={handleLinkInputChange}
                    required
                    placeholder="https://github.com/yourusername"
                  />
                </Grid>
                
                <Grid sx={{ gridColumn: 'span 12' }}>
                  <AdminFormField
                    label="Icon (Optional)"
                    id="icon"
                    value={linkFormData.icon}
                    onChange={handleLinkInputChange}
                    placeholder="Leave blank to use default icon based on platform"
                    helperText="Icon name from Material UI (e.g., GitHubIcon, LinkedInIcon)"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmitLink} 
              variant="contained" 
              disabled={!linkFormData.platform || !linkFormData.url}
            >
              {currentLink ? 'Update Link' : 'Add Link'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete Social Link Confirmation Dialog */}
        <Dialog
          open={deleteLinkDialogOpen}
          onClose={() => setDeleteLinkDialogOpen(false)}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to delete the social link to {currentLink?.platform}? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteLinkDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteLink} 
              color="error" 
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </AdminContentLayout>
    </ProtectedRoute>
  );
};

export default FooterAdmin; 