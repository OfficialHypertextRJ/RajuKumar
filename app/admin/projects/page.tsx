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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Tabs,
  Tab,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  github: string;
  demo: string;
  tags: string[];
  featured: boolean;
  createdAt: any;
  updatedAt: any;
}

const ProjectsAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    github: '',
    demo: '',
    tags: '',
    featured: false
  });
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null]);
  const [imageUploading, setImageUploading] = useState([false, false, false]);
  const [uploadProgress, setUploadProgress] = useState([0, 0, 0]);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchProjects();
    fetchFeaturedProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const projectsList: Project[] = [];
      querySnapshot.forEach((doc) => {
        projectsList.push({ id: doc.id, ...doc.data() } as Project);
      });
      
      setProjects(projectsList);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedProjects = async () => {
    try {
      const featuredRef = doc(db, 'settings', 'homepage');
      const featuredDoc = await getDoc(featuredRef);
      
      if (featuredDoc.exists()) {
        const data = featuredDoc.data();
        setFeaturedProjects(data.featuredProjects || []);
      } else {
        // Create the document if it doesn't exist
        await setDoc(doc(db, 'settings', 'homepage'), {
          featuredProjects: []
        });
      }
    } catch (error) {
      console.error('Error fetching featured projects:', error);
      toast.error('Failed to load featured projects settings');
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Update the file state
      const newImageFiles = [...imageFiles];
      newImageFiles[index] = file;
      setImageFiles(newImageFiles);
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (event) => {
        // Create a preview
        const previewUrl = event.target?.result as string;
        
        // For new projects, create a temporary preview array
        if (!currentProject) {
          const tempImages = [...imageFiles.map(() => "")];
          tempImages[index] = previewUrl;
          
          // Create a temporary project object to display the preview
          setCurrentProject({
            id: 'temp',
            title: formData.title,
            description: formData.description,
            images: tempImages,
            github: formData.github,
            demo: formData.demo,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            featured: formData.featured,
            createdAt: null,
            updatedAt: null
          });
        } else {
          // For existing projects
          const newImages = [...(currentProject.images || ['', '', ''])];
          while (newImages.length < 3) newImages.push('');
          
          // Store the preview temporarily
          newImages[index] = previewUrl;
          setCurrentProject({ ...currentProject, images: newImages });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (index: number, projectId: string) => {
    const file = imageFiles[index];
    if (!file) return null;
    
    try {
      // Update uploading state
      const newImageUploading = [...imageUploading];
      newImageUploading[index] = true;
      setImageUploading(newImageUploading);
      
      // Create storage reference
      const storageRef = ref(storage, `projects/${projectId}/image-${index}-${Date.now()}-${file.name}`);
      
      // Upload file with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Track upload progress
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            const newProgress = [...uploadProgress];
            newProgress[index] = progress;
            setUploadProgress(newProgress);
          },
          (error) => {
            // Handle error
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            // Upload completed successfully
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(`Failed to upload image ${index + 1}`);
      return null;
    } finally {
      // Reset uploading state
      const newImageUploading = [...imageUploading];
      newImageUploading[index] = false;
      setImageUploading(newImageUploading);
    }
  };

  const openAddDialog = () => {
    setCurrentProject(null);
    setFormData({
      title: '',
      description: '',
      github: '',
      demo: '',
      tags: '',
      featured: false
    });
    setImageFiles([null, null, null]);
    setDialogOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setCurrentProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      github: project.github || '',
      demo: project.demo || '',
      tags: project.tags ? project.tags.join(', ') : '',
      featured: project.featured || false
    });
    setImageFiles([null, null, null]);
    setDialogOpen(true);
  };

  const openDeleteDialog = (project: Project) => {
    setCurrentProject(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!currentProject) return;
    
    try {
      setSaving(true);
      
      // Delete images from storage
      if (currentProject.images && currentProject.images.length > 0) {
        for (const imageUrl of currentProject.images) {
          if (imageUrl && imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
            try {
              // Extract the storage path from the URL
              const storageRef = ref(storage, imageUrl);
              await deleteObject(storageRef);
            } catch (error) {
              console.error('Error deleting image:', error);
              // Continue with deletion even if image deletion fails
            }
          }
        }
      }
      
      // Delete project document
      await deleteDoc(doc(db, 'projects', currentProject.id));
      
      // Remove from featured projects if needed
      if (featuredProjects.includes(currentProject.id)) {
        const newFeaturedProjects = featuredProjects.filter(id => id !== currentProject.id);
        await updateDoc(doc(db, 'settings', 'homepage'), {
          featuredProjects: newFeaturedProjects
        });
        setFeaturedProjects(newFeaturedProjects);
      }
      
      // Update UI
      setProjects(projects.filter(p => p.id !== currentProject.id));
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false);
      setCurrentProject(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        github: formData.github,
        demo: formData.demo,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        featured: formData.featured,
        updatedAt: serverTimestamp()
      };
      
      let projectId: string;
      
      if (currentProject) {
        // Update existing project
        projectId = currentProject.id;
        await updateDoc(doc(db, 'projects', projectId), projectData);
      } else {
        // Create new project
        const newProjectRef = await addDoc(collection(db, 'projects'), {
          ...projectData,
          images: [],
          createdAt: serverTimestamp()
        });
        projectId = newProjectRef.id;
      }
      
      // Upload any new images
      const uploadPromises = [];
      const newImages = currentProject ? [...currentProject.images || []] : [];
      
      // Ensure newImages has 3 elements
      while (newImages.length < 3) newImages.push('');
      
      for (let i = 0; i < imageFiles.length; i++) {
        if (imageFiles[i]) {
          uploadPromises.push(
            uploadImage(i, projectId).then(url => {
              if (url) newImages[i] = url;
            })
          );
        }
      }
      
      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
      
      // Update the project with new image URLs
      await updateDoc(doc(db, 'projects', projectId), { images: newImages });
      
      // Update featured projects if needed
      if (formData.featured && !featuredProjects.includes(projectId)) {
        const newFeaturedProjects = [...featuredProjects, projectId];
        await updateDoc(doc(db, 'settings', 'homepage'), {
          featuredProjects: newFeaturedProjects
        });
        setFeaturedProjects(newFeaturedProjects);
      } else if (!formData.featured && featuredProjects.includes(projectId)) {
        const newFeaturedProjects = featuredProjects.filter(id => id !== projectId);
        await updateDoc(doc(db, 'settings', 'homepage'), {
          featuredProjects: newFeaturedProjects
        });
        setFeaturedProjects(newFeaturedProjects);
      }
      
      // Refresh projects list
      await fetchProjects();
      
      toast.success(currentProject ? 'Project updated successfully' : 'Project added successfully');
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error(currentProject ? 'Failed to update project' : 'Failed to add project');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFeatured = async (projectId: string, isFeatured: boolean) => {
    try {
      let newFeaturedProjects: string[];
      
      if (isFeatured) {
        // Remove from featured
        newFeaturedProjects = featuredProjects.filter(id => id !== projectId);
      } else {
        // Add to featured (limit to 3)
        if (featuredProjects.length >= 3) {
          toast.error('You can only have 3 featured projects. Remove one first.');
          return;
        }
        newFeaturedProjects = [...featuredProjects, projectId];
      }
      
      // Update in Firestore
      await updateDoc(doc(db, 'settings', 'homepage'), {
        featuredProjects: newFeaturedProjects
      });
      
      // Update local state
      setFeaturedProjects(newFeaturedProjects);
      
      // Update project's featured status
      await updateDoc(doc(db, 'projects', projectId), {
        featured: !isFeatured
      });
      
      // Update local projects state
      setProjects(projects.map(project => 
        project.id === projectId 
          ? { ...project, featured: !isFeatured } 
          : project
      ));
      
      toast.success(isFeatured ? 'Project removed from featured' : 'Project added to featured');
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error('Failed to update featured status');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AdminContentLayout title="Projects">
          <LoadingSpinner />
        </AdminContentLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminContentLayout title="Projects">
        <Box sx={{ width: '100%', mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="project tabs">
              <Tab label="All Projects" />
              <Tab label="Featured Projects" />
            </Tabs>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">
              {tabValue === 0 ? 'All Projects' : 'Featured Projects'} 
              <Chip 
                label={tabValue === 0 ? projects.length : featuredProjects.length} 
                size="small" 
                sx={{ ml: 1 }} 
              />
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={openAddDialog}
            >
              Add New Project
            </Button>
          </Box>
          
          {tabValue === 0 ? (
            // All Projects Tab
            <Grid container spacing={3}>
              {projects.length > 0 ? (
                projects.map((project) => (
                  <Grid item xs={12} sm={6} md={4} key={project.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={project.images && project.images[0] ? project.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={project.title}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography gutterBottom variant="h6" component="div" sx={{ mr: 2 }}>
                            {project.title}
                          </Typography>
                          <IconButton 
                            size="small" 
                            color={project.featured ? "warning" : "default"}
                            onClick={() => handleToggleFeatured(project.id, project.featured)}
                            title={project.featured ? "Remove from featured" : "Add to featured"}
                          >
                            {project.featured ? <StarIcon /> : <StarBorderIcon />}
                          </IconButton>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {project.description.length > 100 
                            ? `${project.description.substring(0, 100)}...` 
                            : project.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                          {project.tags && project.tags.map((tag, index) => (
                            <Chip key={index} label={tag} size="small" />
                          ))}
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          startIcon={<EditIcon />}
                          onClick={() => openEditDialog(project)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          color="error" 
                          startIcon={<DeleteIcon />}
                          onClick={() => openDeleteDialog(project)}
                        >
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No projects added yet. Click the "Add New Project" button to create your first project.
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          ) : (
            // Featured Projects Tab
            <Paper sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select up to 3 projects to feature on your homepage. These will be displayed in the featured projects section.
              </Typography>
              
              <List>
                {projects.map((project) => (
                  <React.Fragment key={project.id}>
                    <ListItem>
                      <ListItemText
                        primary={project.title}
                        secondary={
                          <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                            {project.description.length > 100 
                              ? `${project.description.substring(0, 100)}...` 
                              : project.description}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          checked={featuredProjects.includes(project.id)}
                          onChange={() => handleToggleFeatured(
                            project.id, 
                            featuredProjects.includes(project.id)
                          )}
                          disabled={
                            !featuredProjects.includes(project.id) && 
                            featuredProjects.length >= 3
                          }
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
              
              {projects.length === 0 && (
                <Typography variant="body1" color="text.secondary" align="center">
                  No projects available to feature. Add projects first.
                </Typography>
              )}
            </Paper>
          )}
        </Box>
        
        {/* Add/Edit Project Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)}
          fullWidth
          maxWidth="md"
          PaperProps={{
            style: {
              backgroundColor: '#1a1a1a !important',
              backgroundImage: 'none !important',
              color: '#ffffff',
              opacity: 1
            },
            sx: {
              bgcolor: '#1a1a1a !important',
              backgroundImage: 'none !important'
            }
          }}
        >
          <DialogTitle>
            {currentProject ? 'Edit Project' : 'Add New Project'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" noValidate sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <AdminFormField
                    label="Project Title"
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <AdminFormField
                    label="Description"
                    id="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    type="textarea"
                    rows={4}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <AdminFormField
                    label="GitHub Link"
                    id="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <GitHubIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <AdminFormField
                    label="Demo Link"
                    id="demo"
                    value={formData.demo}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <AdminFormField
                    label="Tags (comma separated)"
                    id="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="React, Next.js, TailwindCSS"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.featured}
                        onChange={handleCheckboxChange}
                        name="featured"
                        color="primary"
                      />
                    }
                    label="Feature this project on homepage"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Project Images
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Upload up to 3 images for this project. The first image will be used as the thumbnail.
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {[0, 1, 2].map((index) => {
                      // Check if this image or any previous image has content
                      const shouldShow = index === 0 || 
                        (currentProject && currentProject.images && 
                         [...Array(index)].some((_, i) => currentProject.images[i] && currentProject.images[i].trim() !== ''));
                      
                      if (!shouldShow) return null;
                      
                      return (
                      <Grid item xs={12} sm={4} key={index}>
                        <Box
                          sx={{
                            width: '100%',
                            height: 180,
                            border: '1px dashed',
                            borderColor: 'divider',
                            borderRadius: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mb: 1,
                            position: 'relative',
                            overflow: 'hidden',
                            bgcolor: '#000000'
                          }}
                        >
                          {currentProject && currentProject.images && currentProject.images[index] ? (
                            <img
                              src={currentProject.images[index]}
                              alt={`Project image ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <ImageIcon sx={{ fontSize: 40, color: '#ffffff', mb: 1 }} />
                              <Typography variant="body2" color="#ffffff">
                                Image {index + 1}
                              </Typography>
                            </Box>
                          )}
                          
                          {imageUploading[index] && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                bgcolor: 'rgba(0,0,0,0.9)',
                                color: 'white'
                              }}
                            >
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                Uploading... {uploadProgress[index]}%
                              </Typography>
                              <Box
                                sx={{
                                  width: '80%',
                                  height: 4,
                                  bgcolor: '#333333',
                                  borderRadius: 1,
                                  overflow: 'hidden'
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${uploadProgress[index]}%`,
                                    height: '100%',
                                    bgcolor: 'primary.main',
                                    transition: 'width 0.3s'
                                  }}
                                />
                              </Box>
                            </Box>
                          )}
                        </Box>
                        
                        <Button
                          component="label"
                          variant="outlined"
                          size="small"
                          fullWidth
                          startIcon={<ImageIcon />}
                        >
                          Choose Image
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => handleImageChange(e, index)}
                          />
                        </Button>
                      </Grid>
                      );
                    })}
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              disabled={saving || !formData.title || !formData.description}
            >
              {saving ? 'Saving...' : currentProject ? 'Update Project' : 'Add Project'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            style: {
              backgroundColor: '#1a1a1a !important',
              backgroundImage: 'none !important',
              color: '#ffffff',
              opacity: 1
            },
            sx: {
              bgcolor: '#1a1a1a !important',
              backgroundImage: 'none !important'
            }
          }}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to delete the project "{currentProject?.title}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteProject} 
              color="error" 
              variant="contained"
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </AdminContentLayout>
    </ProtectedRoute>
  );
};

export default ProjectsAdmin; 