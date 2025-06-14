'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminContentLayout from '@/components/AdminContentLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { format } from 'date-fns';

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: any;
  timestamp: string;
}

export default function AdminActivity() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterAction, setFilterAction] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchActivityLogs() {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Create query for activity logs
        const activityRef = collection(db, 'adminActivity');
        const activityQuery = query(
          activityRef,
          orderBy('timestamp', 'desc'),
          limit(100)
        );
        
        const querySnapshot = await getDocs(activityQuery);
        const logs: ActivityLog[] = [];
        
        querySnapshot.forEach((doc) => {
          logs.push({
            id: doc.id,
            ...doc.data()
          } as ActivityLog);
        });
        
        setActivityLogs(logs);
      } catch (error) {
        console.error('Error fetching activity logs:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchActivityLogs();
  }, [currentUser]);
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilterAction(event.target.value);
    setPage(0);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  // Filter logs based on selected action and search term
  const filteredLogs = activityLogs.filter(log => {
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesSearch = searchTerm === '' || 
      JSON.stringify(log).toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesAction && matchesSearch;
  });
  
  // Get unique action types for filter dropdown
  const actionTypes = ['all', ...new Set(activityLogs.map(log => log.action))];
  
  return (
    <ProtectedRoute>
      <AdminContentLayout 
        title="Admin Activity Logs" 
        description="View and monitor all admin activity on your portfolio website"
      >
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              label="Search logs"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ flexGrow: 1, minWidth: '200px' }}
            />
            <FormControl sx={{ minWidth: '150px' }} size="small">
              <InputLabel id="action-filter-label">Filter by Action</InputLabel>
              <Select
                labelId="action-filter-label"
                value={filterAction}
                label="Filter by Action"
                onChange={handleFilterChange}
              >
                {actionTypes.map((action) => (
                  <MenuItem key={action} value={action}>
                    {action === 'all' ? 'All Actions' : action.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          {loading ? (
            <Typography>Loading activity logs...</Typography>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table sx={{ minWidth: 650 }} aria-label="activity logs table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredLogs
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((log) => (
                        <TableRow
                          key={log.id}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={log.action.replace('_', ' ')} 
                              size="small"
                              color={
                                log.action.includes('delete') ? 'error' :
                                log.action.includes('create') ? 'success' :
                                log.action.includes('update') ? 'info' :
                                'default'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <pre style={{ 
                              whiteSpace: 'pre-wrap', 
                              fontSize: '0.8rem',
                              maxHeight: '100px',
                              overflow: 'auto'
                            }}>
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </TableCell>
                        </TableRow>
                      ))}
                    {filteredLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No activity logs found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredLogs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </Box>
      </AdminContentLayout>
    </ProtectedRoute>
  );
}
