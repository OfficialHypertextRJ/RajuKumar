'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminContentLayout from '@/components/AdminContentLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { logAdminActivity } from '@/lib/adminUtils';
import { useAuth } from '@/contexts/AuthContext';
import { DeleteOutline, CheckCircle, Cancel } from '@mui/icons-material';

interface Subscriber {
  id: string;
  email: string;
  createdAt: Timestamp;
  active: boolean;
}

const SubscribersAdmin = () => {
  const { currentUser } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const subscribersRef = collection(db, 'subscribers');
      const q = query(subscribersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const subscribersList: Subscriber[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        subscribersList.push({
          id: doc.id,
          email: data.email,
          createdAt: data.createdAt,
          active: data.active || true
        });
      });
      
      setSubscribers(subscribersList);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDeleteClick = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSubscriber) return;
    
    try {
      await deleteDoc(doc(db, 'subscribers', selectedSubscriber.id));
      
      // Log the activity
      if (currentUser) {
        await logAdminActivity(currentUser.uid, 'Deleted subscriber', `Deleted subscriber: ${selectedSubscriber.email}`);
      }
      
      toast.success(`Subscriber ${selectedSubscriber.email} removed`);
      setSubscribers(prev => prev.filter(sub => sub.id !== selectedSubscriber.id));
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      toast.error("Failed to delete subscriber");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedSubscriber(null);
    }
  };

  const toggleSubscriberStatus = async (subscriber: Subscriber) => {
    try {
      const newStatus = !subscriber.active;
      await updateDoc(doc(db, 'subscribers', subscriber.id), {
        active: newStatus
      });
      
      // Log the activity
      if (currentUser) {
        await logAdminActivity(
          currentUser.uid, 
          newStatus ? 'Activated subscriber' : 'Deactivated subscriber', 
          `${newStatus ? 'Activated' : 'Deactivated'} subscriber: ${subscriber.email}`
        );
      }
      
      toast.success(`Subscriber ${subscriber.email} ${newStatus ? 'activated' : 'deactivated'}`);
      
      // Update state
      setSubscribers(prev => 
        prev.map(sub => 
          sub.id === subscriber.id ? {...sub, active: newStatus} : sub
        )
      );
    } catch (error) {
      console.error("Error updating subscriber status:", error);
      toast.error("Failed to update subscriber status");
    }
  };

  return (
    <ProtectedRoute>
      <AdminContentLayout
        title="Newsletter Subscribers"
        description="Manage your newsletter subscribers"
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Total subscribers: {subscribers.length}
          </Typography>
          
          {loading ? (
            <LoadingSpinner />
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Date Subscribed</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscribers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No subscribers yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell>{subscriber.email}</TableCell>
                        <TableCell>
                          {subscriber.createdAt ? 
                            format(subscriber.createdAt.toDate(), 'MMM dd, yyyy h:mm a') : 
                            'Unknown date'
                          }
                        </TableCell>
                        <TableCell>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color: subscriber.active ? 'success.main' : 'text.disabled'
                          }}>
                            {subscriber.active ? 
                              <CheckCircle fontSize="small" sx={{ mr: 1 }} /> : 
                              <Cancel fontSize="small" sx={{ mr: 1 }} />
                            }
                            {subscriber.active ? 'Active' : 'Inactive'}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Button 
                            size="small"
                            onClick={() => toggleSubscriberStatus(subscriber)}
                            sx={{ mr: 1 }}
                          >
                            {subscriber.active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button 
                            color="error" 
                            startIcon={<DeleteOutline />} 
                            size="small"
                            onClick={() => handleDeleteClick(subscriber)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Delete confirmation dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Subscriber</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to remove {selectedSubscriber?.email} from your subscribers list? 
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </AdminContentLayout>
    </ProtectedRoute>
  );
};

export default SubscribersAdmin; 