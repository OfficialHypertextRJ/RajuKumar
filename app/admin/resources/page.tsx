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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Card,
  CardContent,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIndicatorIcon
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
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  link: string;
  image?: string;
  categoryId?: string;
}

interface ResourceCategory {
  id: string;
  name: string;
  description: string;
  order: number;
  items: ResourceItem[];
}

const ResourcesAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItemDialogOpen, setDeleteItemDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<ResourceCategory | null>(null);
  const [currentItem, setCurrentItem] = useState<ResourceItem | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: ''
  });
  const [itemFormData, setItemFormData] = useState({
    title: '',
    description: '',
    link: '',
    image: '',
    categoryId: ''
  });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | false>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const categoriesRef = collection(db, 'resourceCategories');
      const q = query(categoriesRef, orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      
      console.log("Admin - Fetched categories:", querySnapshot.size);
      
      const categoriesList: ResourceCategory[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Admin - Category data:", doc.id, data);
        
        // Ensure we have the correct structure
        categoriesList.push({ 
          id: doc.id, 
          name: data.name || '',
          description: data.description || '',
          order: data.order || 0,
          items: data.items || []
        });
      });
      
      console.log("Admin - Processed categories:", categoriesList);
      
      setCategories(categoriesList);
    } catch (error) {
      console.error('Error fetching resource categories:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setCategoryFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleItemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setItemFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    setItemFormData(prev => ({ ...prev, categoryId: e.target.value }));
  };

  const openAddCategoryDialog = () => {
    setCurrentCategory(null);
    setCategoryFormData({
      name: '',
      description: ''
    });
    setCategoryDialogOpen(true);
  };

  const openEditCategoryDialog = (category: ResourceCategory) => {
    setCurrentCategory(category);
    setCategoryFormData({
      name: category.name || '',
      description: category.description || ''
    });
    setCategoryDialogOpen(true);
  };

  const openDeleteCategoryDialog = (category: ResourceCategory) => {
    setCurrentCategory(category);
    setDeleteDialogOpen(true);
  };

  const openAddItemDialog = (categoryId?: string) => {
    setCurrentItem(null);
    setItemFormData({
      title: '',
      description: '',
      link: '',
      image: '',
      categoryId: categoryId || ''
    });
    setImageFile(null);
    setImagePreview('');
    setUploadProgress(0);
    setItemDialogOpen(true);
  };

  const openEditItemDialog = (item: ResourceItem, categoryId: string) => {
    setCurrentItem(item);
    setItemFormData({
      title: item.title || '',
      description: item.description || '',
      link: item.link || '',
      image: item.image || '',
      categoryId
    });
    setImageFile(null);
    setImagePreview('');
    setUploadProgress(0);
    setItemDialogOpen(true);
  };

  const openDeleteItemDialog = (item: ResourceItem, categoryId: string) => {
    setCurrentItem({...item, categoryId});
    setDeleteItemDialogOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!currentCategory) return;
    
    try {
      setSaving(true);
      
      // Delete category document
      await deleteDoc(doc(db, 'resourceCategories', currentCategory.id));
      
      // Update UI
      setCategories(categories.filter(c => c.id !== currentCategory.id));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false);
      setCurrentCategory(null);
    }
  };

  const handleDeleteItem = async () => {
    if (!currentItem || !currentItem.categoryId) return;
    
    try {
      setSaving(true);
      
      // Find the category
      const categoryIndex = categories.findIndex(c => c.id === currentItem.categoryId);
      if (categoryIndex === -1) {
        throw new Error('Category not found');
      }
      
      // Remove item from category
      const category = categories[categoryIndex];
      const updatedItems = category.items.filter(item => item.id !== currentItem.id);
      
      // Update in Firestore
      await updateDoc(doc(db, 'resourceCategories', currentItem.categoryId), {
        items: updatedItems
      });
      
      // Update UI
      const updatedCategories = [...categories];
      updatedCategories[categoryIndex] = {
        ...category,
        items: updatedItems
      };
      setCategories(updatedCategories);
      
      toast.success('Resource item deleted successfully');
    } catch (error) {
      console.error('Error deleting resource item:', error);
      toast.error('Failed to delete resource item');
    } finally {
      setSaving(false);
      setDeleteItemDialogOpen(false);
      setCurrentItem(null);
    }
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const categoryData = {
        name: categoryFormData.name,
        description: categoryFormData.description,
        updatedAt: serverTimestamp()
      };
      
      if (currentCategory) {
        // Update existing category
        await updateDoc(doc(db, 'resourceCategories', currentCategory.id), categoryData);
        
        // Update UI
        setCategories(categories.map(category => 
          category.id === currentCategory.id 
            ? { ...category, ...categoryData } 
            : category
        ));
        
        toast.success('Category updated successfully');
      } else {
        // Create new category
        const newCategoryData = {
          ...categoryData,
          items: [],
          order: categories.length,
          createdAt: serverTimestamp()
        };
        
        const newCategoryRef = await addDoc(collection(db, 'resourceCategories'), newCategoryData);
        
        // Update UI
        setCategories([...categories, { 
          id: newCategoryRef.id, 
          ...newCategoryData, 
          items: []
        } as ResourceCategory]);
        
        toast.success('Category added successfully');
      }
      
      setCategoryDialogOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(currentCategory ? 'Failed to update category' : 'Failed to add category');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return '';
    
    try {
      setUploading(true);
      
      // Create a unique filename
      const fileName = `resource-${Date.now()}-${imageFile.name.replace(/\s+/g, '_')}`;
      const storageRef = ref(storage, `resources/${fileName}`);
      
      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, imageFile);
      
      return new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setUploadProgress(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              console.error('Error getting download URL:', error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let imageUrl = itemFormData.image;
      
      // Upload image if a new one is selected
      if (imageFile) {
        imageUrl = await uploadImage();
      }
      
      const itemData = {
        title: itemFormData.title,
        description: itemFormData.description,
        link: itemFormData.link,
        image: imageUrl
      };
      
      // Find the category
      const categoryIndex = categories.findIndex(c => c.id === itemFormData.categoryId);
      if (categoryIndex === -1) {
        throw new Error('Category not found');
      }
      
      const category = categories[categoryIndex];
      let updatedItems: ResourceItem[];
      
      if (currentItem) {
        // Update existing item
        updatedItems = category.items.map(item => 
          item.id === currentItem.id ? { ...item, ...itemData } : item
        );
      } else {
        // Create new item
        const newItem = {
          ...itemData,
          id: `item-${Date.now()}`
        };
        
        updatedItems = [...category.items, newItem];
      }
      
      // Update in Firestore
      await updateDoc(doc(db, 'resourceCategories', itemFormData.categoryId), {
        items: updatedItems
      });
      
      // Update UI
      const updatedCategories = [...categories];
      updatedCategories[categoryIndex] = {
        ...category,
        items: updatedItems
      };
      setCategories(updatedCategories);
      
      toast.success(currentItem ? 'Resource item updated successfully' : 'Resource item added successfully');
      setItemDialogOpen(false);
      
      // Reset image state
      setImageFile(null);
      setImagePreview('');
      setUploadProgress(0);
    } catch (error) {
      console.error('Error saving resource item:', error);
      toast.error(currentItem ? 'Failed to update resource item' : 'Failed to add resource item');
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }
    
    const { source, destination, type } = result;
    
    // Reordering categories
    if (type === 'category') {
      const reorderedCategories = Array.from(categories);
      const [removed] = reorderedCategories.splice(source.index, 1);
      reorderedCategories.splice(destination.index, 0, removed);
      
      // Update order property
      const updatedCategories = reorderedCategories.map((category, index) => ({
        ...category,
        order: index
      }));
      
      // Update UI immediately for better UX
      setCategories(updatedCategories);
      
      // Update in Firestore
      try {
        // Update each category with its new order
        const updatePromises = updatedCategories.map(category => 
          updateDoc(doc(db, 'resourceCategories', category.id), { order: category.order })
        );
        
        await Promise.all(updatePromises);
      } catch (error) {
        console.error('Error updating category order:', error);
        toast.error('Failed to update category order');
        // Revert to original order on error
        fetchCategories();
      }
      return;
    }
    
    // Reordering items within a category
    const categoryId = result.source.droppableId.replace('items-', '');
    const categoryIndex = categories.findIndex(c => c.id === categoryId);
    
    if (categoryIndex === -1) return;
    
    const category = categories[categoryIndex];
    const items = Array.from(category.items);
    const [removed] = items.splice(source.index, 1);
    items.splice(destination.index, 0, removed);
    
    // Update UI immediately
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex] = {
      ...category,
      items
    };
    setCategories(updatedCategories);
    
    // Update in Firestore
    try {
      await updateDoc(doc(db, 'resourceCategories', categoryId), {
        items
      });
    } catch (error) {
      console.error('Error updating item order:', error);
      toast.error('Failed to update item order');
      // Revert to original order on error
      fetchCategories();
    }
  };

  // Add a function to reset form state
  const resetFormState = () => {
    setImageFile(null);
    setImagePreview('');
    setUploadProgress(0);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AdminContentLayout title="Resources">
          <LoadingSpinner />
        </AdminContentLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminContentLayout title="Resources">
        <Box sx={{ width: '100%', mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">
              Resource Categories
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={openAddCategoryDialog}
            >
              Add Category
            </Button>
          </Box>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="categories" type="category">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {categories.length > 0 ? (
                    categories.map((category, index) => (
                      <Draggable key={category.id} draggableId={category.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <Accordion 
                              expanded={expanded === category.id} 
                              onChange={handleAccordionChange(category.id)}
                              sx={{ mb: 2 }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={`panel-${category.id}-content`}
                                id={`panel-${category.id}-header`}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                  <div {...provided.dragHandleProps} style={{ marginRight: 16 }}>
                                    <DragIndicatorIcon color="action" />
                                  </div>
                                  <Typography sx={{ flexGrow: 1 }}>{category.name}</Typography>
                                  <Box sx={{ ml: 2 }}>
                                    <IconButton 
                                      size="small" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditCategoryDialog(category);
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton 
                                      size="small" 
                                      color="error" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openDeleteCategoryDialog(category);
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Box>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                  {category.description}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                  <Typography variant="subtitle2">
                                    Resource Items
                                  </Typography>
                                  <Button 
                                    size="small" 
                                    startIcon={<AddIcon />}
                                    onClick={() => openAddItemDialog(category.id)}
                                  >
                                    Add Item
                                  </Button>
                                </Box>
                                
                                <Droppable droppableId={`items-${category.id}`} type={`items-${category.id}`}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                    >
                                      {category.items && category.items.length > 0 ? (
                                        <List>
                                          {category.items.map((item, itemIndex) => (
                                            <Draggable 
                                              key={item.id} 
                                              draggableId={item.id} 
                                              index={itemIndex}
                                            >
                                              {(provided) => (
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                >
                                                  <ListItem
                                                    sx={{ 
                                                      bgcolor: 'background.paper', 
                                                      mb: 1, 
                                                      borderRadius: 1,
                                                      border: '1px solid',
                                                      borderColor: 'divider'
                                                    }}
                                                  >
                                                    <div {...provided.dragHandleProps} style={{ marginRight: 16 }}>
                                                      <DragIndicatorIcon color="action" />
                                                    </div>
                                                    
                                                    {/* Add image preview */}
                                                    {item.image && (
                                                      <Box 
                                                        sx={{ 
                                                          width: 40, 
                                                          height: 40, 
                                                          mr: 2, 
                                                          borderRadius: 1,
                                                          overflow: 'hidden',
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          justifyContent: 'center',
                                                          bgcolor: 'rgba(255,255,255,0.05)'
                                                        }}
                                                      >
                                                        <img 
                                                          src={item.image} 
                                                          alt={item.title}
                                                          style={{ 
                                                            maxWidth: '100%', 
                                                            maxHeight: '100%',
                                                            objectFit: 'contain'
                                                          }} 
                                                        />
                                                      </Box>
                                                    )}
                                                    
                                                    <ListItemText
                                                      primary={item.title}
                                                      secondary={
                                                        <>
                                                          {item.description}
                                                          {item.link && (
                                                            <Typography 
                                                              component="span" 
                                                              variant="body2" 
                                                              color="primary"
                                                              sx={{ display: 'block', mt: 0.5 }}
                                                            >
                                                              Link: {item.link}
                                                            </Typography>
                                                          )}
                                                        </>
                                                      }
                                                    />
                                                    <ListItemSecondaryAction>
                                                      <IconButton 
                                                        edge="end" 
                                                        aria-label="edit"
                                                        onClick={() => openEditItemDialog(item, category.id)}
                                                      >
                                                        <EditIcon />
                                                      </IconButton>
                                                      <IconButton 
                                                        edge="end" 
                                                        aria-label="delete" 
                                                        color="error"
                                                        onClick={() => openDeleteItemDialog(item, category.id)}
                                                      >
                                                        <DeleteIcon />
                                                      </IconButton>
                                                    </ListItemSecondaryAction>
                                                  </ListItem>
                                                </div>
                                              )}
                                            </Draggable>
                                          ))}
                                          {provided.placeholder}
                                        </List>
                                      ) : (
                                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                                          <Typography variant="body2" color="text.secondary">
                                            No items in this category yet.
                                          </Typography>
                                        </Paper>
                                      )}
                                      {provided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              </AccordionDetails>
                            </Accordion>
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        No resource categories added yet. Click the "Add Category" button to create your first category.
                      </Typography>
                    </Paper>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Box>
        
        {/* Add/Edit Category Dialog */}
        <Dialog 
          open={categoryDialogOpen} 
          onClose={() => setCategoryDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {currentCategory ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" noValidate sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <AdminFormField
                    label="Category Name"
                    id="name"
                    value={categoryFormData.name}
                    onChange={handleCategoryInputChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <AdminFormField
                    label="Description"
                    id="description"
                    value={categoryFormData.description}
                    onChange={handleCategoryInputChange}
                    type="textarea"
                    rows={3}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmitCategory} 
              variant="contained" 
              disabled={saving || !categoryFormData.name}
            >
              {saving ? 'Saving...' : currentCategory ? 'Update Category' : 'Add Category'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Add/Edit Item Dialog */}
        <Dialog 
          open={itemDialogOpen} 
          onClose={() => {
            setItemDialogOpen(false);
            resetFormState();
          }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {currentItem ? 'Edit Resource Item' : 'Add New Resource Item'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" noValidate sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="category-select-label">Category</InputLabel>
                    <Select
                      labelId="category-select-label"
                      id="category-select"
                      value={itemFormData.categoryId}
                      label="Category"
                      onChange={handleCategoryChange}
                      disabled={!!currentItem}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <AdminFormField
                    label="Item Title"
                    id="title"
                    value={itemFormData.title}
                    onChange={handleItemInputChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <AdminFormField
                    label="Description"
                    id="description"
                    value={itemFormData.description}
                    onChange={handleItemInputChange}
                    type="textarea"
                    rows={3}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <AdminFormField
                    label="Link (URL)"
                    id="link"
                    value={itemFormData.link}
                    onChange={handleItemInputChange}
                    placeholder="https://example.com"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Resource Icon/Image
                  </Typography>
                  
                  {/* Image URL input */}
                  <AdminFormField
                    label="Image URL"
                    id="image"
                    value={itemFormData.image}
                    onChange={handleItemInputChange}
                    placeholder="https://example.com/image.png"
                    helperText="Enter a URL or upload an image below"
                  />
                  
                  {/* Image upload */}
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="image-upload"
                      type="file"
                      onChange={handleImageChange}
                    />
                    <label htmlFor="image-upload">
                      <Button 
                        variant="outlined" 
                        component="span"
                        startIcon={<AddIcon />}
                      >
                        Upload Image
                      </Button>
                    </label>
                  </Box>
                  
                  {/* Image preview */}
                  {(imagePreview || itemFormData.image) && (
                    <Box 
                      sx={{ 
                        mt: 2, 
                        p: 2, 
                        border: '1px solid', 
                        borderColor: 'divider',
                        borderRadius: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        Image Preview
                      </Typography>
                      <Box 
                        sx={{ 
                          width: 100, 
                          height: 100, 
                          bgcolor: 'background.paper',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 1,
                          overflow: 'hidden'
                        }}
                      >
                        <img 
                          src={imagePreview || itemFormData.image} 
                          alt="Preview" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '100%', 
                            objectFit: 'contain' 
                          }} 
                        />
                      </Box>
                      
                      {/* Upload progress */}
                      {uploading && (
                        <Box sx={{ width: '100%', mt: 2 }}>
                          <Typography variant="body2" align="center">
                            Uploading: {uploadProgress}%
                          </Typography>
                          <div style={{ 
                            width: '100%', 
                            height: 4, 
                            backgroundColor: '#eee',
                            borderRadius: 2,
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${uploadProgress}%`,
                              height: '100%',
                              backgroundColor: '#3bcf9a'
                            }} />
                          </div>
                        </Box>
                      )}
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setItemDialogOpen(false);
              resetFormState();
            }}>Cancel</Button>
            <Button 
              onClick={handleSubmitItem} 
              variant="contained" 
              disabled={saving || !itemFormData.title || !itemFormData.categoryId}
            >
              {saving ? 'Saving...' : currentItem ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete Category Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to delete the category "{currentCategory?.name}"? This will also delete all items in this category. This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteCategory} 
              color="error" 
              variant="contained"
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete Item Confirmation Dialog */}
        <Dialog
          open={deleteItemDialogOpen}
          onClose={() => setDeleteItemDialogOpen(false)}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to delete the resource item "{currentItem?.title}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteItemDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteItem} 
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

export default ResourcesAdmin; 