'use client';

import { useState } from 'react';
import { Box, Typography, TextField, Button, Card, Container } from '@mui/material';
import Squares from './Squares';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

const ConnectWithMe = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    
    try {
      // Check if email already exists
      const subscribersRef = collection(db, 'subscribers');
      const q = query(subscribersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        toast.success('You are already subscribed!');
        setEmail('');
        setLoading(false);
        return;
      }
      
      // Add new subscriber
      await addDoc(collection(db, 'subscribers'), {
        email,
        createdAt: serverTimestamp(),
        active: true,
      });
      
      toast.success('Successfully subscribed to newsletter!');
    setEmail('');
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast.error('Failed to subscribe. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ my: 8 }}>
      <Card sx={{ 
        p: 5, 
        borderRadius: 3, 
        background: 'linear-gradient(145deg, rgba(23,23,23,0.9) 0%, rgba(13,13,13,0.95) 100%)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Squares Background */}
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 1,
          }}
        >
          <Squares 
            speed={0.5}
            squareSize={40}
            direction='diagonal'
            borderColor='rgba(255, 255, 255, 0.1)'
            hoverFillColor='rgba(59, 207, 154, 0.3)'
            className='connect-squares'
          />
        </Box>

        <Box sx={{ textAlign: 'center', mb: 3, position: 'relative', zIndex: 2 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
            CONNECT WITH ME ON
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            I occasionally write about design, technology, and share 
            thoughts on the intersection of creativity and engineering.
          </Typography>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2,
          justifyContent: 'center',
          mt: 3,
          position: 'relative', 
          zIndex: 2
        }}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            sx={{ 
              maxWidth: { sm: 400 },
              '& .MuiOutlinedInput-root': {
                bgcolor: '#0d0d0d !important',
                borderRadius: 2,
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                }
              },
              '& .MuiInputBase-input': {
                color: '#ffffff !important',
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.2)',
              },
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.3)',
              }
            }}
            InputProps={{
              style: {
                backgroundColor: '#0d0d0d',
                color: '#ffffff'
              }
            }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{ 
              height: { sm: '56px' },
              px: 4, 
              bgcolor: 'white', 
              color: 'black',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
              }
            }}
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </Box>
      </Card>
    </Container>
  );
};

export default ConnectWithMe; 