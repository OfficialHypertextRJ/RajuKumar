'use client';

import React, { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminContentLayout from '@/components/AdminContentLayout';
import AdminFormField from '@/components/AdminFormField';
import AdminSubmitButton from '@/components/AdminSubmitButton';
import LoadingSpinner from '@/components/LoadingSpinner';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
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
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Image as ImageIcon,
  CalendarMonth as CalendarIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
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
  where,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { sendNewPostNotification } from '@/lib/emailService';

// Import Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <Box sx={{ height: '400px', border: '1px solid #444', borderRadius: 1 }}><LoadingSpinner /></Box>
});

// Quill modules and formats
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    ['blockquote', 'code-block'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false
  }
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'blockquote', 'code-block',
  'color', 'background',
  'align',
  'link', 'image'
];

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  category: string;
  publishDate: any;
  status: 'published' | 'draft' | 'scheduled';
  createdAt: any;
  updatedAt: any;
}

const BlogAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    publishDate: '',
    status: 'draft'
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [filter, setFilter] = useState('all');
  
  // To fix hydration errors with React Quill
  const [editorMounted, setEditorMounted] = useState(false);
  
  useEffect(() => {
    // Debug authentication state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('User authenticated:', user.email);
        // Check if token has admin claim
        const token = await user.getIdTokenResult(true);
        console.log('Admin status:', token.claims.admin);
        console.log('User ID:', user.uid);
        console.log('Token expiration:', new Date(token.expirationTime));
      } else {
        console.log('No user is authenticated');
      }
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchBlogPosts();
    setEditorMounted(true);
  }, []);

  const fetchBlogPosts = async () => {
    setLoading(true);
    
    try {
      // Force a token refresh
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken(true);
        console.log('Token refreshed before fetching blog posts');
      }
      
      const postsQuery = query(collection(db, 'blog'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(postsQuery);
      
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];
      
      console.log('Blog posts fetched:', posts.length);
      setBlogPosts(posts);
      setLoading(false);
      
      // Log fetched posts for debugging
      console.log('Fetched blog posts:', JSON.stringify(posts.map(p => ({ id: p.id, title: p.title, status: p.status }))));

      return posts;
    } catch (error: any) {
      console.error('Error fetching blog posts:', error);
      toast.error(`Failed to load blog posts: ${error.message || 'Unknown error'}`);
      setLoading(false);
      return [];
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (event: React.ChangeEvent<{ value: unknown }> | any) => {
    setFilter(event.target.value as string);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }> | any) => {
    setFormData(prev => ({ ...prev, status: event.target.value as string }));
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadCoverImage = async (postId: string): Promise<string> => {
    if (!coverImageFile) return '';
    
    try {
      console.log('Starting cover image upload for post:', postId);
      console.log('Storage bucket:', storage.bucket);
      
      // Force token refresh before upload
      await auth.currentUser?.getIdToken(true);
      
      const storageRef = ref(storage, `blog/${postId}/${coverImageFile.name}`);
      
      console.log('Storage reference created:', storageRef.fullPath);
      
      // Upload the file with explicit content type
      const metadata = {
        contentType: coverImageFile.type,
        customMetadata: {
          'postId': postId
        }
      };
      
      const uploadTask = uploadBytesResumable(storageRef, coverImageFile, metadata);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload progress:', progress.toFixed(2) + '%');
            setUploadProgress(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            // Get download URL after successful upload
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('File available at:', downloadURL);
              
              // Store the URL in state for preview
              setCoverImagePreview(downloadURL);
              
              resolve(downloadURL);
            } catch (urlError) {
              console.error('Error getting download URL:', urlError);
              reject(urlError);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error in uploadCoverImage:', error);
      throw error;
    }
  };

  const openAddDialog = () => {
    setCurrentPost(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: '',
      publishDate: new Date().toISOString().split('T')[0],
      status: 'draft'
    });
    setCoverImageFile(null);
    setCoverImagePreview('');
    setDialogOpen(true);
  };

  const openEditDialog = (post: BlogPost) => {
    setCurrentPost(post);
    setFormData({
      title: post.title || '',
      content: post.content || '',
      excerpt: post.excerpt || '',
      category: post.category || '',
      publishDate: post.publishDate ? new Date(post.publishDate.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: post.status || 'draft'
    });
    setCoverImageFile(null);
    setCoverImagePreview(post.coverImage || '');
    setDialogOpen(true);
  };

  const openDeleteDialog = (post: BlogPost) => {
    setCurrentPost(post);
    setDeleteDialogOpen(true);
  };

  const handleDeletePost = async () => {
    if (!currentPost) return;
    
    try {
      setSaving(true);
      
      // Delete cover image from storage if it exists
      if (currentPost.coverImage && currentPost.coverImage.startsWith('https://firebasestorage.googleapis.com')) {
        try {
          // Extract the storage path from the URL
          const storageRef = ref(storage, currentPost.coverImage);
          await deleteObject(storageRef);
        } catch (error) {
          console.error('Error deleting cover image:', error);
          // Continue with deletion even if image deletion fails
        }
      }
      
      // Delete blog post document
      await deleteDoc(doc(db, 'blog', currentPost.id));
      
      // Update UI
      setBlogPosts(blogPosts.filter(p => p.id !== currentPost.id));
      toast.success('Blog post deleted successfully');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error('Failed to delete blog post');
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false);
      setCurrentPost(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate content to ensure it's not empty
      if (!formData.title.trim()) {
        toast.error('Please enter a title for your blog post');
        setSaving(false);
        return;
      }

      if (!formData.content.trim()) {
        toast.error('Please enter some content for your blog post');
        setSaving(false);
        return;
      }
      
      // Refresh the authentication token before making Firestore requests
      await auth.currentUser?.getIdToken(true);
      
      // Always publish posts immediately for testing
      const status = 'published';
      const publishDate = formData.publishDate ? new Date(formData.publishDate) : new Date();
      
      // Create excerpt from content
      const excerptText = formData.excerpt || 
                          formData.content
                            .replace(/<[^>]*>/g, '')  // Remove HTML tags
                            .trim()
                            .substring(0, 150) + '...';
      
      const postData = {
        title: formData.title,
        content: formData.content,
        excerpt: excerptText,
        category: formData.category,
        publishDate,
        status,
        updatedAt: serverTimestamp()
      };
      
      let postId: string;
      
      if (currentPost) {
        // Update existing post
        postId = currentPost.id;
        await updateDoc(doc(db, 'blog', postId), postData);
        console.log('Blog post updated with ID:', postId);
      } else {
        // Create new post
        const newPostRef = await addDoc(collection(db, 'blog'), {
          ...postData,
          coverImage: '',
          createdAt: serverTimestamp()
        });
        postId = newPostRef.id;
        console.log('New blog post created with ID:', postId);
      }
      
      // Upload cover image if provided
      if (coverImageFile) {
        try {
          // Force token refresh specifically for storage operation
          await auth.currentUser?.getIdToken(true);
          
          const imageUrl = await uploadCoverImage(postId);
          if (imageUrl) {
            // Update the post document with the cover image URL
            await updateDoc(doc(db, 'blog', postId), { 
              coverImage: imageUrl 
            });
            console.log('Cover image URL saved to post:', imageUrl);
          } else {
            console.error('Image URL was empty after upload');
          }
        } catch (imageError: any) {
          console.error('Error uploading cover image:', imageError);
          toast.error('Post saved but cover image failed to upload: ' + (imageError.message || 'Unknown error'));
        }
      }
      
      // Close dialog first to prevent UI freeze
      setDialogOpen(false);
      
      // Notify other components about the blog update via localStorage
      try {
        localStorage.setItem('blog_updated', Date.now().toString());
        // Also dispatch a storage event to notify other tabs/windows
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'blog_updated',
          newValue: Date.now().toString()
        }));
        
        // Force page reload to refresh blog content
        // This ensures the UI reflects the latest changes
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } catch (e) {
        console.error('Failed to update localStorage:', e);
      }
      
      // Then refresh blog posts list and show success message
      const updatedPosts = await fetchBlogPosts();
      
      // Update local state directly in case fetch failed
      if (currentPost) {
        // Update existing post in the local state
        setBlogPosts(prev => 
          prev.map(p => p.id === postId ? { 
            ...p, 
            ...postData, 
            coverImage: coverImageFile ? p.coverImage : coverImagePreview 
          } : p)
        );
      } else if (postId) {
        // Add new post to local state
        const newPost = {
          id: postId,
          ...postData,
          coverImage: '',
          createdAt: new Date(),
          status: status as 'published' | 'draft' | 'scheduled'
        } as BlogPost;
        setBlogPosts(prev => [newPost, ...prev]);
      }
      
      toast.success(currentPost ? 'Blog post updated successfully' : 'Blog post added successfully');
      
      // Send notification to subscribers if this is a new published post
      if (!currentPost && status === 'published') {
        try {
          // Build the post URL
          const postUrl = `${window.location.origin}/blog/${postId}`;
          await sendNewPostNotification(
            formData.title,
            excerptText,
            postUrl
          );
          toast.success('Notification sent to subscribers');
        } catch (emailError) {
          console.error('Failed to send subscriber notifications:', emailError);
          toast.error('Post published but failed to notify subscribers');
        }
      }
    } catch (error: any) {
      console.error('Error saving blog post:', error);
      toast.error(`Failed to ${currentPost ? 'update' : 'add'} blog post: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    try {
      // Refresh the authentication token before changing post status
      await auth.currentUser?.getIdToken(true);
      
      // Always set to published for testing
      const newStatus = 'published';
      
      await updateDoc(doc(db, 'blog', post.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      const updatedPost = { ...post, status: newStatus };
      setBlogPosts(blogPosts.map(p => p.id === post.id ? updatedPost : p));
      
      toast.success(`Post ${newStatus === 'published' ? 'published' : 'unpublished'}`);
      
      // Notify other components about the blog update
      try {
        localStorage.setItem('blog_updated', Date.now().toString());
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'blog_updated',
          newValue: Date.now().toString()
        }));
      } catch (e) {
        console.error('Failed to update localStorage:', e);
      }
    } catch (error: any) {
      console.error('Error toggling post status:', error);
      toast.error('Failed to update post status: ' + (error.message || 'Unknown error'));
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.seconds 
      ? new Date(timestamp.seconds * 1000) 
      : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const filteredPosts = blogPosts.filter(post => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AdminContentLayout title="Blog">
          <LoadingSpinner />
        </AdminContentLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminContentLayout title="Blog">
        <Box sx={{ width: '100%', mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="blog tabs">
              <Tab label="All Posts" />
              <Tab label="Scheduled Posts" />
            </Tabs>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ mr: 2 }}>
                {tabValue === 0 ? 'Blog Posts' : 'Scheduled Posts'} 
                <Chip 
                  label={tabValue === 0 
                    ? blogPosts.length 
                    : blogPosts.filter(post => post.status === 'scheduled').length
                  } 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
              </Typography>
              
              {tabValue === 0 && (
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="status-filter-label">Filter</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={filter}
                    onChange={handleFilterChange}
                    label="Filter"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                    <MenuItem value="draft">Drafts</MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
            
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={openAddDialog}
            >
              New Blog Post
            </Button>
          </Box>
          
          {tabValue === 0 ? (
            // All Posts Tab
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="blog posts table">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Publish Date</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell component="th" scope="row">
                          {post.title}
                        </TableCell>
                        <TableCell>{post.category || 'Uncategorized'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={post.status} 
                            color={
                              post.status === 'published' ? 'success' : 
                              post.status === 'scheduled' ? 'primary' : 
                              'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(post.publishDate)}</TableCell>
                        <TableCell>{formatDate(post.createdAt)}</TableCell>
                        <TableCell align="right">
                          <IconButton 
                            size="small" 
                            onClick={() => handleToggleStatus(post)}
                            title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                            color={post.status === 'published' ? 'success' : 'default'}
                          >
                            {post.status === 'published' ? <VisibilityIcon /> : <VisibilityOffIcon />}
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => openEditDialog(post)}
                            title="Edit"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => openDeleteDialog(post)}
                            title="Delete"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No blog posts found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            // Scheduled Posts Tab
            <Grid container spacing={3}>
              {blogPosts.filter(post => post.status === 'scheduled').length > 0 ? (
                blogPosts
                  .filter(post => post.status === 'scheduled')
                  .map((post) => (
                    <Grid item xs={12} sm={6} md={4} key={post.id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardMedia
                          component="img"
                          height="140"
                          image={post.coverImage || 'https://via.placeholder.com/300x140?text=No+Cover+Image'}
                          alt={post.title}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography gutterBottom variant="h6" component="div">
                            {post.title}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CalendarIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                            <Typography variant="body2" color="text.secondary">
                              Scheduled for {formatDate(post.publishDate)}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary">
                            {post.excerpt?.substring(0, 100)}...
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            startIcon={<EditIcon />}
                            onClick={() => openEditDialog(post)}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="small" 
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleToggleStatus(post)}
                          >
                            Publish Now
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No scheduled posts. You can schedule posts by selecting the "Scheduled" status and setting a future publish date.
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </Box>
        
        {/* Add/Edit Blog Post Dialog */}
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
            {currentPost ? 'Edit Blog Post' : 'Create New Blog Post'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" noValidate sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <AdminFormField
                    label="Post Title"
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <AdminFormField
                    label="Category"
                    id="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g. Web Development"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      id="status"
                      value={formData.status}
                      onChange={handleStatusChange}
                      label="Status"
                    >
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                      <MenuItem value="scheduled">Scheduled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {(formData.status === 'scheduled' || formData.status === 'published') && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Publish Date"
                      type="date"
                      id="publishDate"
                      value={formData.publishDate}
                      onChange={handleInputChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Content
                  </Typography>
                  {editorMounted && (
                    <Box 
                      sx={{
                        border: '1px solid #444', 
                        borderRadius: 1, 
                        mb: 2,
                        '& .ql-toolbar': {
                          borderColor: '#444',
                          borderTopLeftRadius: 4,
                          borderTopRightRadius: 4,
                          backgroundColor: '#252525'
                        },
                        '& .ql-container': {
                          borderColor: '#444',
                          borderBottomLeftRadius: 4,
                          borderBottomRightRadius: 4,
                          backgroundColor: '#1a1a1a',
                          minHeight: '300px',
                          fontSize: '16px'
                        },
                        '& .ql-editor': {
                          minHeight: '300px',
                          maxHeight: '600px',
                          overflowY: 'auto'
                        },
                        '& .ql-editor p, & .ql-editor li': {
                          color: '#e0e0e0'
                        },
                        '& .ql-snow .ql-stroke': {
                          stroke: '#e0e0e0'
                        },
                        '& .ql-snow .ql-fill': {
                          fill: '#e0e0e0'
                        },
                        '& .ql-snow .ql-picker': {
                          color: '#e0e0e0'
                        },
                        '& .ql-snow .ql-picker-options': {
                          backgroundColor: '#303030',
                          border: '1px solid #444'
                        }
                      }}
                    >
                      <ReactQuill
                        value={formData.content}
                        onChange={handleContentChange}
                        modules={quillModules}
                        formats={quillFormats}
                        theme="snow"
                        placeholder="Write your blog content here..."
                      />
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <AdminFormField
                    label="Excerpt (optional)"
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                    placeholder="A brief summary of your post. If left empty, the first 150 characters of your content will be used."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Cover Image
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
                      bgcolor: 'background.paper'
                    }}
                  >
                    {coverImagePreview ? (
                      <img
                        src={coverImagePreview}
                        alt="Cover preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <ImageIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No cover image selected
                        </Typography>
                      </Box>
                    )}
                    
                    {imageUploading && (
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
                          bgcolor: 'rgba(0,0,0,0.7)',
                          color: 'white'
                        }}
                      >
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Uploading... {uploadProgress}%
                        </Typography>
                        <Box
                          sx={{
                            width: '80%',
                            height: 4,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            overflow: 'hidden'
                          }}
                        >
                          <Box
                            sx={{
                              width: `${uploadProgress}%`,
                              height: '100%',
                              bgcolor: 'primary.main',
                              transition: 'width 0.3s'
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<ImageIcon />}
                    >
                      Choose Cover Image
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleCoverImageChange}
                      />
                    </Button>
                    
                    {coverImagePreview && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setCoverImageFile(null);
                          setCoverImagePreview('');
                        }}
                      >
                        Remove Cover Image
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              disabled={saving || !formData.title || !formData.content}
            >
              {saving ? 'Saving...' : currentPost ? 'Update Post' : 'Create Post'}
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
              Are you sure you want to delete the blog post "{currentPost?.title}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDeletePost} 
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

export default BlogAdmin; 