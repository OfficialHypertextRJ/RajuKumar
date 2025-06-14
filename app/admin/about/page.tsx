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
  Button, 
  IconButton, 
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { auth } from '@/lib/firebase';

interface AboutData {
  // Introduction section
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
  
  // Work Experience section
  experience: {
    company: string;
    position: string;
    duration: string;
    description: string[];
    images: string[];
  }[];
  
  // Studies section
  education: {
    institution: string;
    course?: string;
    department: string;
    percentage?: string;
    cgpa?: string;
    duration: string;
  }[];
  
  // Technical Skills section
  skills: {
    name: string;
    description: string;
    imageUrl?: string;
  }[];
}

const AboutAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [aboutData, setAboutData] = useState<AboutData>({
    name: '',
    designation: '',
    profileImage: '',
    location: '',
    languages: [],
    introduction: '',
    links: {
      github: '',
      linkedin: '',
      email: ''
    },
    experience: [],
    education: [],
    skills: []
  });
  
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [languagesInput, setLanguagesInput] = useState<string>('');

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const aboutDocRef = doc(db, 'content', 'about');
      const aboutDoc = await getDoc(aboutDocRef);
      
      if (aboutDoc.exists()) {
        const data = aboutDoc.data() as AboutData;
        setAboutData({
          ...data,
          languages: data.languages || [],
          links: data.links || { github: '', linkedin: '', email: '' },
          experience: data.experience || [],
          education: data.education || [],
          skills: data.skills || []
        });
        
        setLanguagesInput(data.languages?.join(', ') || '');
      } else {
        // Create the document if it doesn't exist
        const initialData = {
          name: 'Software Developer & Data Analyst',
          designation: 'Software Developer & Data Analyst',
          profileImage: '',
          location: '',
          languages: [],
          introduction: 'I build things for the web and analyze data.',
          links: {
            github: '',
            linkedin: '',
            email: ''
          },
          experience: [],
          education: [],
          skills: [],
          createdAt: serverTimestamp()
        };
        await setDoc(aboutDocRef, initialData);
        setAboutData(initialData);
        setLanguagesInput('');
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
      toast.error('Failed to load about data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (field: string, value: string) => {
    setAboutData(prev => ({ ...prev, [field]: value }));
  };

  const handleLanguagesInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLanguagesInput(value);
    
    const languagesArray = value.split(',').map(lang => lang.trim()).filter(Boolean);
    setAboutData(prev => ({
      ...prev,
      languages: languagesArray
    }));
  };

  const handleSkillsChange = (index: number, field: string, value: string) => {
    setAboutData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index 
          ? { ...skill, [field]: value }
          : skill
      )
    }));
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    setAboutData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const handleExperienceChange = (index: number, field: string, value: string | string[]) => {
    setAboutData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImageFile(e.target.files[0]);
    }
  };

  const uploadProfileImage = async () => {
    if (!profileImageFile) return null;
    
    try {
      setImageUploading(true);
      console.log('Starting profile image upload...');
      
      // Create storage reference
      const storageRef = ref(storage, `about/${Date.now()}-${profileImageFile.name.replace(/\s+/g, '-')}`);
      console.log('Storage reference created:', storageRef.fullPath);
      
      // Upload file with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, profileImageFile);
      
      return new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Track upload progress
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setUploadProgress(progress);
            console.log(`Upload progress: ${progress}%`);
          },
          (error) => {
            // Handle error
            console.error('Upload error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            
            if (error.code === 'storage/unauthorized') {
              console.error('Authentication issue - current user:', auth.currentUser?.email);
              toast.error('Authentication error: You do not have permission to upload files');
            }
            
            reject(error);
          },
          async () => {
            // Upload completed successfully
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Upload completed successfully, URL:', downloadURL);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error('Failed to upload profile image');
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Upload profile image if provided
      let profileImageUrl = aboutData.profileImage;
      
      if (profileImageFile) {
        const uploadedUrl = await uploadProfileImage();
        if (uploadedUrl) {
          profileImageUrl = uploadedUrl;
        }
      }
      
      // Update about data
      const updatedData = {
        ...aboutData,
        profileImage: profileImageUrl,
        updatedAt: serverTimestamp()
      };
      
      // Save to Firestore
      await updateDoc(doc(db, 'content', 'about'), updatedData);
      
      // Update local state
      setAboutData(updatedData);
      setProfileImageFile(null);
      
      // Revalidate the about page to update the cache
      await fetch('/api/about', { method: 'POST' });
      
      toast.success('About information updated successfully');
    } catch (error) {
      console.error('Error updating about information:', error);
      toast.error('Failed to update about information');
    } finally {
      setSaving(false);
    }
  };

  const addEducation = () => {
    setAboutData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        course: '',
        department: '',
        percentage: '',
        cgpa: '',
        duration: ''
      }]
    }));
  };

  const addExperience = () => {
    setAboutData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company: '',
        position: '',
        duration: '',
        description: [],
        images: []
      }]
    }));
  };

  const removeEducation = (index: number) => {
    setAboutData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const removeExperience = (index: number) => {
    setAboutData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleLinkChange = (field: string, value: string) => {
    setAboutData(prev => ({
      ...prev,
      links: {
        ...prev.links,
        [field]: value
      }
    }));
  };

  const handleExperienceImageUpload = async (file: File, expIndex: number, imageIndex: number) => {
    if (!file) return;
    
    try {
      setImageUploading(true);
      
      const storageRef = ref(storage, `about/${Date.now()}-${file.name.replace(/\s+/g, '-')}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Error uploading image:', error);
          setImageUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          setAboutData(prev => {
            const updatedExperiences = [...prev.experience];
            const updatedImages = [...(updatedExperiences[expIndex].images || [])];
            
            if (imageIndex >= 0 && imageIndex < updatedImages.length) {
              updatedImages[imageIndex] = downloadURL;
            } else if (updatedImages.length < 2) {
              updatedImages.push(downloadURL);
            }
            
            updatedExperiences[expIndex] = {
              ...updatedExperiences[expIndex],
              images: updatedImages
            };
            
            return {
              ...prev,
              experience: updatedExperiences
            };
          });
          
          setImageUploading(false);
          setUploadProgress(0);
        }
      );
    } catch (error) {
      console.error('Error handling image upload:', error);
      setImageUploading(false);
    }
  };

  const removeExperienceImage = (expIndex: number, imageIndex: number) => {
    setAboutData(prev => {
      const updatedExperiences = [...prev.experience];
      if (updatedExperiences[expIndex]?.images) {
        updatedExperiences[expIndex].images = updatedExperiences[expIndex].images.filter((_, i) => i !== imageIndex);
      }
      return {
        ...prev,
        experience: updatedExperiences
      };
    });
  };

  const handleSkillImageUpload = async (file: File, skillIndex: number) => {
    if (!file) return;
    
    try {
      setImageUploading(true);
      
      const storageRef = ref(storage, `about/${Date.now()}-${file.name.replace(/\s+/g, '-')}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Error uploading image:', error);
          setImageUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          setAboutData(prev => {
            const updatedSkills = [...prev.skills];
            updatedSkills[skillIndex] = {
              ...updatedSkills[skillIndex],
              imageUrl: downloadURL
            };
            
            return {
              ...prev,
              skills: updatedSkills
            };
          });
          
          setImageUploading(false);
          setUploadProgress(0);
        }
      );
    } catch (error) {
      console.error('Error handling skill image upload:', error);
      setImageUploading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AdminContentLayout title="About">
          <LoadingSpinner />
        </AdminContentLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminContentLayout title="About">
        <Box sx={{ width: '100%', mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="about tabs">
              <Tab label="Introduction" />
              <Tab label="Work Experience" />
              <Tab label="Education" />
              <Tab label="Skills" />
            </Tabs>
          </Box>
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Introduction Tab */}
            {tabValue === 0 && (
              <Paper sx={{ p: 3 }} component="div">
                <Typography variant="h6" gutterBottom>
                  Introduction
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid sx={{ gridColumn: 'span 12' }}>
                    <AdminFormField
                      label="Name"
                      id="name"
                      value={aboutData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  
                  <Grid sx={{ gridColumn: 'span 12' }}>
                    <AdminFormField
                      label="Designation"
                      id="designation"
                      value={aboutData.designation || ''}
                      onChange={(e) => handleInputChange('designation', e.target.value)}
                      placeholder="e.g., Software Engineer"
                      fullWidth
                    />
                  </Grid>
                  
                  <Grid sx={{ gridColumn: 'span 12' }}>
                    <AdminFormField
                      label="Introduction"
                      id="introduction"
                      value={aboutData.introduction || ''}
                      onChange={(e) => handleInputChange('introduction', e.target.value)}
                      type="textarea"
                      rows={3}
                      placeholder="Brief introduction about yourself"
                      fullWidth
                    />
                  </Grid>
                  
                  <Grid sx={{ gridColumn: 'span 12' }}>
                    <AdminFormField
                      label="Location"
                      id="location"
                      value={aboutData.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City, Country"
                      fullWidth
                    />
                  </Grid>
                  
                  <Grid sx={{ gridColumn: 'span 12' }}>
                    <AdminFormField
                      label="Languages (comma separated)"
                      id="languages"
                      value={languagesInput}
                      onChange={handleLanguagesInputChange}
                      placeholder="English, Hindi, etc."
                      helperText="Enter languages you speak, separated by commas"
                    />
                  </Grid>
                  
                  <Grid sx={{ gridColumn: 'span 12' }} component="div">
                    <Typography variant="subtitle1" gutterBottom>
                      Social Links
                    </Typography>
                    
                    <Grid container spacing={2} component="div">
                      <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }} component="div">
                        <AdminFormField
                          label="GitHub"
                          id="github"
                          value={aboutData.links?.github || ''}
                          onChange={(e) => handleLinkChange('github', e.target.value)}
                          placeholder="https://github.com/yourusername"
                        />
                      </Grid>
                      <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }} component="div">
                        <AdminFormField
                          label="LinkedIn"
                          id="linkedin"
                          value={aboutData.links?.linkedin || ''}
                          onChange={(e) => handleLinkChange('linkedin', e.target.value)}
                          placeholder="https://linkedin.com/in/yourusername"
                        />
                      </Grid>
                      <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }} component="div">
                        <AdminFormField
                          label="Email"
                          id="email"
                          value={aboutData.links?.email || ''}
                          onChange={(e) => handleLinkChange('email', e.target.value)}
                          placeholder="your.email@example.com"
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid sx={{ gridColumn: 'span 12' }} component="div">
                    <Typography variant="subtitle1" gutterBottom>
                      Profile Image
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {aboutData.profileImage && (
                        <Box
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            mr: 2,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <img
                            src={aboutData.profileImage}
                            alt="Profile"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </Box>
                      )}
                      
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<ImageIcon />}
                        disabled={imageUploading}
                        >
                        {aboutData.profileImage ? 'Change Image' : 'Upload Image'}
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleProfileImageChange}
                          />
                        </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}
            
            {/* Work Experience Tab */}
            {tabValue === 1 && (
              <Paper sx={{ p: 3 }} component="div">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Work Experience
                </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addExperience}
                    variant="outlined"
                  >
                    Add Experience
                  </Button>
                </Box>

                {(aboutData.experience || []).map((exp, index) => (
                  <Box key={index} sx={{ mb: 4, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1">Experience {index + 1}</Typography>
                      <IconButton onClick={() => removeExperience(index)} color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    <Grid container spacing={3} component="div">
                      <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
                        <AdminFormField
                          label="Company"
                          id={`company-${index}`}
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                          placeholder="Company name"
                        />
                      </Grid>
                      <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
                        <AdminFormField
                          label="Position"
                          id={`position-${index}`}
                          value={exp.position}
                          onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                          placeholder="Job title"
                        />
                      </Grid>
                      <Grid sx={{ gridColumn: 'span 12' }} component="div">
                        <AdminFormField
                          label="Duration"
                          id={`duration-${index}`}
                          value={exp.duration}
                          onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                          placeholder="e.g., Apr 2025 - Present"
                        />
                      </Grid>
                      <Grid sx={{ gridColumn: 'span 12' }} component="div">
                <AdminFormField
                          label="Description"
                          id={`description-${index}`}
                          value={exp.description?.join('\n') || ''}
                          onChange={(e) => handleExperienceChange(index, 'description', e.target.value.split('\n'))}
                          type="textarea"
                  rows={4}
                          placeholder="Enter each responsibility on a new line"
                          helperText="Each line will be treated as a separate bullet point"
                />
                      </Grid>
                
                      <Grid sx={{ gridColumn: 'span 12' }} component="div">
                  <Typography variant="subtitle1" gutterBottom>
                          Images (Maximum 2)
                  </Typography>
                  
                        <Box sx={{ mb: 2 }}>
                          <Grid container spacing={2} component="div">
                            {exp.images?.map((imageUrl, imageIndex) => (
                              <Grid sx={{ gridColumn: 'span 6' }} md={4} key={imageIndex} component="div">
                                <Box sx={{
                                  position: 'relative',
                                  width: '100%',
                                  height: 150,
                          border: '1px solid',
                                  borderColor: 'divider',
                          borderRadius: 1,
                                  overflow: 'hidden'
                                }}>
                                  <img
                                    src={imageUrl}
                                    alt={`${exp.company} image ${imageIndex + 1}`}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                  />
                                  <IconButton 
                                    sx={{ 
                                      position: 'absolute', 
                                      top: 5, 
                                      right: 5,
                                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                      '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                      }
                                    }}
                                    size="small"
                                    onClick={() => removeExperienceImage(index, imageIndex)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>
                              </Grid>
                            ))}
                            
                            {(!exp.images || exp.images.length < 2) && (
                              <Grid sx={{ gridColumn: 'span 6' }} md={4} component="div">
                                <Button
                                  component="label"
                                  variant="outlined"
                                  startIcon={<ImageIcon />}
                                  disabled={imageUploading}
                                  sx={{
                                    height: 150,
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                        }}
                      >
                                  Upload Image
                                  <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) {
                                        handleExperienceImageUpload(e.target.files[0], index, exp.images?.length || 0);
                                      }
                                    }}
                                  />
                                </Button>
                              </Grid>
                            )}
                          </Grid>
                      </Box>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Paper>
            )}
            
            {/* Education Tab */}
            {tabValue === 2 && (
              <Paper sx={{ p: 3 }} component="div">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Education
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addEducation}
                    variant="outlined"
                  >
                    Add Education
                  </Button>
                </Box>

                {(aboutData.education || []).map((edu, index) => (
                  <Box key={index} sx={{ mb: 4, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1">Education {index + 1}</Typography>
                      <IconButton onClick={() => removeEducation(index)} color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    <Grid container spacing={3} component="div">
                      <Grid sx={{ gridColumn: 'span 12' }} md={6} component="div">
                        <AdminFormField
                          label="Institution"
                          id={`institution-${index}`}
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                          placeholder="School/University name"
                        />
                      </Grid>
                      <Grid sx={{ gridColumn: 'span 12' }} md={6} component="div">
                        <AdminFormField
                          label="Course (Optional)"
                          id={`course-${index}`}
                          value={edu.course || ''}
                          onChange={(e) => handleEducationChange(index, 'course', e.target.value)}
                          placeholder="Course name (optional)"
                        />
                      </Grid>
                      <Grid sx={{ gridColumn: 'span 12' }} md={6} component="div">
                        <AdminFormField
                          label="Department"
                          id={`department-${index}`}
                          value={edu.department}
                          onChange={(e) => handleEducationChange(index, 'department', e.target.value)}
                          placeholder="Department or School Level"
                        />
                      </Grid>
                      <Grid sx={{ gridColumn: 'span 12' }} md={6} component="div">
                        <AdminFormField
                          label="Duration"
                          id={`duration-${index}`}
                          value={edu.duration}
                          onChange={(e) => handleEducationChange(index, 'duration', e.target.value)}
                          placeholder="e.g., 2022-2026"
                        />
                      </Grid>
                      <Grid sx={{ gridColumn: 'span 12' }} md={6} component="div">
                        <AdminFormField
                          label="CGPA"
                          id={`cgpa-${index}`}
                          value={edu.cgpa || ''}
                          onChange={(e) => handleEducationChange(index, 'cgpa', e.target.value)}
                          placeholder="e.g., 9.21"
                        />
                      </Grid>
                      <Grid sx={{ gridColumn: 'span 12' }} md={6} component="div">
                        <AdminFormField
                          label="Percentage"
                          id={`percentage-${index}`}
                          value={edu.percentage || ''}
                          onChange={(e) => handleEducationChange(index, 'percentage', e.target.value)}
                          placeholder="e.g., 92.5%"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Paper>
            )}

            {/* Skills Tab */}
            {tabValue === 3 && (
              <Paper sx={{ p: 3 }} component="div">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Technical Skills
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setAboutData(prev => ({
                        ...prev,
                        skills: [...prev.skills, { name: '', description: '' }]
                      }));
                    }}
                    variant="outlined"
                  >
                    Add Skill
                  </Button>
                </Box>

                {(aboutData.skills || []).map((skill, index) => (
                  <Box key={index} sx={{ mb: 4, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1">Skill {index + 1}</Typography>
                      <IconButton
                        onClick={() => {
                          setAboutData(prev => ({
                            ...prev,
                            skills: prev.skills.filter((_, i) => i !== index)
                          }));
                        }}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    <Grid container spacing={3} component="div">
                      <Grid sx={{ gridColumn: 'span 12' }} component="div">
                        <AdminFormField
                          label="Skill Name"
                          id={`skill-name-${index}`}
                          value={skill.name}
                          onChange={(e) => {
                            setAboutData(prev => {
                              const updatedSkills = [...prev.skills];
                              updatedSkills[index] = {
                                ...updatedSkills[index],
                                name: e.target.value
                              };
                              return {
                                ...prev,
                                skills: updatedSkills
                              };
                            });
                          }}
                          placeholder="e.g., React.js"
                        />
                      </Grid>
                      <Grid sx={{ gridColumn: 'span 12' }} component="div">
                        <AdminFormField
                          label="Description"
                          id={`skill-description-${index}`}
                          value={skill.description}
                          onChange={(e) => {
                            setAboutData(prev => {
                              const updatedSkills = [...prev.skills];
                              updatedSkills[index] = {
                                ...updatedSkills[index],
                                description: e.target.value
                              };
                              return {
                                ...prev,
                                skills: updatedSkills
                              };
                            });
                          }}
                          type="textarea"
                          rows={2}
                          placeholder="Brief description of your skill"
                        />
                      </Grid>

                      <Grid sx={{ gridColumn: 'span 12' }} component="div">
                        <Typography variant="subtitle2" gutterBottom>
                          Skill Image
                </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {skill.imageUrl && (
                            <Box
                              sx={{
                                width: 150,
                                height: 100,
                                borderRadius: 1,
                                overflow: 'hidden',
                                mr: 2,
                                border: '1px solid',
                                borderColor: 'divider'
                              }}
                            >
                              <img
                                src={skill.imageUrl}
                                alt={skill.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </Box>
                          )}
                          
                          <Button
                            component="label"
                            variant="outlined"
                            startIcon={<ImageIcon />}
                            disabled={imageUploading}
                          >
                            {skill.imageUrl ? 'Change Image' : 'Upload Image'}
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleSkillImageUpload(e.target.files[0], index);
                                }
                              }}
                            />
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Paper>
            )}
            
            <Box sx={{ mt: 3 }}>
              <AdminSubmitButton
                saving={saving}
                label="Save About Information"
                disabled={imageUploading}
              />
            </Box>
          </Box>
        </Box>
      </AdminContentLayout>
    </ProtectedRoute>
  );
};

export default AboutAdmin; 