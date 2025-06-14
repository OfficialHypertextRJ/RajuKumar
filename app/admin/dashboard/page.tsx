'use client';

import React from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminContentLayout from '@/components/AdminContentLayout';
import { Box, Card, CardContent, Typography, Button, Divider } from '@mui/material';
import { 
  ImageOutlined, 
  WorkOutlineOutlined, 
  ArticleOutlined, 
  MenuBookOutlined, 
  SettingsOutlined,
  PersonOutlineOutlined,
  HistoryOutlined
} from '@mui/icons-material';

const AdminDashboard = () => {
  const adminSections = [
    { 
      title: 'Hero Section', 
      description: 'Manage hero section content and images',
      icon: <ImageOutlined sx={{ fontSize: 40 }} />,
      link: '/admin/hero',
      color: '#4caf50'
    },
    { 
      title: 'Projects', 
      description: 'Add, edit and manage your projects',
      icon: <WorkOutlineOutlined sx={{ fontSize: 40 }} />,
      link: '/admin/projects',
      color: '#2196f3'
    },
    { 
      title: 'Blog', 
      description: 'Create, edit, schedule and publish blog posts',
      icon: <ArticleOutlined sx={{ fontSize: 40 }} />,
      link: '/admin/blog',
      color: '#ff9800'
    },
    { 
      title: 'About', 
      description: 'Update your about page content',
      icon: <PersonOutlineOutlined sx={{ fontSize: 40 }} />,
      link: '/admin/about',
      color: '#9c27b0'
    },
    { 
      title: 'Resources', 
      description: 'Manage resources and learning materials',
      icon: <MenuBookOutlined sx={{ fontSize: 40 }} />,
      link: '/admin/resources',
      color: '#f44336'
    },
    { 
      title: 'Footer', 
      description: 'Update footer information and links',
      icon: <SettingsOutlined sx={{ fontSize: 40 }} />,
      link: '/admin/footer',
      color: '#607d8b'
    }
  ];

  return (
    <ProtectedRoute>
      <AdminContentLayout title="Admin Dashboard">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Welcome to your Portfolio Admin Panel
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all aspects of your portfolio website from this dashboard.
          </Typography>
        </Box>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {adminSections.map((section, index) => (
            <div key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      color: section.color
                    }}
                  >
                    {section.icon}
                  </Box>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {section.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    {section.description}
                  </Typography>
                  <Link href={section.link} passHref>
                    <Button 
                      variant="outlined" 
                      sx={{ 
                        mt: 'auto',
                        borderColor: section.color,
                        color: section.color,
                        '&:hover': {
                          borderColor: section.color,
                          backgroundColor: `${section.color}10`
                        }
                      }}
                    >
                      Manage
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Admin Tools
          </Typography>
        </Box>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                }
              }}
            >
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    color: '#795548'
                  }}
                >
                  <HistoryOutlined sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  Activity Logs
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  View admin activity logs and monitor changes
                </Typography>
                <Link href="/admin/activity" passHref>
                  <Button 
                    variant="outlined" 
                    sx={{ 
                      mt: 'auto',
                      borderColor: '#795548',
                      color: '#795548',
                      '&:hover': {
                        borderColor: '#795548',
                        backgroundColor: '#79554810'
                      }
                    }}
                  >
                    View Logs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminContentLayout>
    </ProtectedRoute>
  );
};

export default AdminDashboard; 