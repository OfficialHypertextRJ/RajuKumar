'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminContentLayout from '@/components/AdminContentLayout';
import AdminSubmitButton from '@/components/AdminSubmitButton';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Box, Grid, Typography, Paper, Button, TextField } from '@mui/material';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { logAdminActivity } from '@/lib/adminUtils';
import { useAuth } from '@/contexts/AuthContext';

const HeroAdmin = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroData, setHeroData] = useState<any>(null);
  const [images, setImages] = useState(['', '', '']);
  const [heading, setHeading] = useState('Hero Section');
  const [description, setDescription] = useState('This is the hero section of your portfolio website.');
  
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null]);
  const [imageUploading, setImageUploading] = useState([false, false, false]);
  const [uploadProgress, setUploadProgress] = useState([0, 0, 0]);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const heroDocRef = doc(db, 'content', 'hero');
        const heroDoc = await getDoc(heroDocRef);
        
        if (heroDoc.exists()) {
          const data = heroDoc.data();
          setHeroData(data);
          setImages(data.images || ['', '', '']);
          setHeading(data.heading || 'Hero Section');
          setDescription(data.description || 'This is the hero section of your portfolio website.');
        }
      } catch (error) {
        console.error('Error fetching hero data:', error);
        toast.error('Failed to load hero content');
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Update the file state
      const newImageFiles = [...imageFiles];
      newImageFiles[index] = file;
      setImageFiles(newImageFiles);
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImages = [...images];
        newImages[index] = event.target?.result as string;
        setImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (index: number) => {
    const file = imageFiles[index];
    if (!file) return null;
    
    try {
      // Update uploading state
      const newImageUploading = [...imageUploading];
      newImageUploading[index] = true;
      setImageUploading(newImageUploading);
      
      // Create storage reference
      const storageRef = ref(storage, `hero/image-${index}-${Date.now()}-${file.name}`);
      
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Upload any new images
      const uploadPromises = [];
      const newImages = [...images];
      
      for (let i = 0; i < imageFiles.length; i++) {
        if (imageFiles[i]) {
          uploadPromises.push(
            uploadImage(i).then(url => {
              if (url) newImages[i] = url;
            })
          );
        }
      }
      
      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
      
      // Prepare hero data with text content and images
      const heroDocRef = doc(db, 'content', 'hero');
      const heroDoc = await getDoc(heroDocRef);
      
      if (heroDoc.exists()) {
        // Document exists, update it
        await updateDoc(heroDocRef, { 
          heading,
          description,
          images: newImages,
          updatedAt: new Date()
        });
      } else {
        // Document doesn't exist, create it
        await setDoc(heroDocRef, {
          heading,
          description,
          images: newImages,
          updatedAt: new Date(),
          createdAt: new Date()
        });
      }
      
      // Log the activity
      if (currentUser) {
        await logAdminActivity(currentUser.uid, 'update_hero_content', {
          timestamp: new Date().toISOString()
        });
      }
      
      toast.success('Hero content updated successfully');
      
      // Update the images state with the new URLs
      setImages(newImages);
      
      // Reset file inputs
      setImageFiles([null, null, null]);
    } catch (error) {
      console.error('Error saving hero content:', error);
      toast.error('Failed to update hero content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AdminContentLayout title="Hero Content">
          <LoadingSpinner />
        </AdminContentLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminContentLayout title="Hero Content">
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Hero Text Content
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Edit the main heading and description text for your hero section.
            </Typography>
            
            <TextField
              label="Heading"
              fullWidth
              margin="normal"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              required
            />
            
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
              required
            />
          </Paper>
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Hero Gallery Images
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload three images for the hero section gallery. All three images must be uploaded for the gallery to display properly.
            </Typography>
            
            <Grid container spacing={3}>
              {[0, 1, 2].map((index) => (
                <Grid key={index} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' }, px: 1.5 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Image {index + 1}
                    </Typography>
                    
                    <Box
                      sx={{
                        width: '100%',
                        height: 200,
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mb: 2,
                        position: 'relative',
                        overflow: 'hidden',
                        bgcolor: '#000000'
                      }}
                    >
                      {images[index] ? (
                        <img
                          src={images[index]}
                          alt={`Hero image ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="#ffffff">
                          No image selected
                        </Typography>
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
                      fullWidth
                      sx={{ mb: 1 }}
                      disabled={imageUploading.some(uploading => uploading)}
                    >
                      Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => handleImageChange(e, index)}
                      />
                    </Button>
                    
                    {images[index] && (
                      <Button
                        variant="text"
                        color="error"
                        size="small"
                        fullWidth
                        onClick={() => {
                          const newImages = [...images];
                          newImages[index] = '';
                          setImages(newImages);
                          
                          const newImageFiles = [...imageFiles];
                          newImageFiles[index] = null;
                          setImageFiles(newImageFiles);
                        }}
                      >
                        Remove Image
                      </Button>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <AdminSubmitButton 
              isLoading={saving}
              label="Save Hero Content" 
            />
          </Box>
        </Box>
      </AdminContentLayout>
    </ProtectedRoute>
  );
};

export default HeroAdmin;
