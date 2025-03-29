import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Image as ImageIcon,
  Videocam as VideoIcon,
  Announcement as AnnouncementIcon,
  Article as NewsIcon,
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import AdminLayout from '../../components/layouts/AdminLayout';

interface HomeUpdate {
  _id?: string;
  title: string;
  content: string;
  type: 'announcement' | 'news' | 'image' | 'video';
  imageUrl?: string;
  videoUrl?: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface FormErrors {
  title?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
}

export default function HomeUpdates() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [homeUpdates, setHomeUpdates] = useState<HomeUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<HomeUpdate | null>(null);
  const [formData, setFormData] = useState<HomeUpdate>({
    title: '',
    content: '',
    type: 'announcement',
    imageUrl: '',
    videoUrl: '',
    isPublished: true,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [filterType, setFilterType] = useState<string | 'all'>('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchHomeUpdates();
    }
  }, [status, session]);

  const fetchHomeUpdates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/home-updates');
      const data = await response.json();
      if (data.success) {
        setHomeUpdates(data.data);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch home updates');
      }
    } catch (err) {
      console.error('Error fetching home updates:', err);
      setError('Failed to fetch home updates. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (update?: HomeUpdate) => {
    if (update) {
      setEditingUpdate(update);
      setFormData(update);
    } else {
      setEditingUpdate(null);
      setFormData({
        title: '',
        content: '',
        type: 'announcement',
        imageUrl: '',
        videoUrl: '',
        isPublished: true,
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUpdate(null);
  };

  const validateForm = () => {
    const errors: FormErrors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    }
    
    if (formData.type === 'image' && !formData.imageUrl?.trim()) {
      errors.imageUrl = 'Image URL is required for image updates';
    }
    
    if (formData.type === 'video' && !formData.videoUrl?.trim()) {
      errors.videoUrl = 'Video URL is required for video updates';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setActionLoading(true);
    
    try {
      const url = editingUpdate && editingUpdate._id 
        ? `/api/home-updates/${editingUpdate._id}` 
        : '/api/home-updates';
      
      const method = editingUpdate && editingUpdate._id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        fetchHomeUpdates();
        handleCloseDialog();
        setError('');
        setSnackbar({
          open: true,
          message: editingUpdate ? 'Home update successfully updated' : 'Home update successfully created',
          severity: 'success'
        });
      } else {
        setError(data.message || `Failed to ${editingUpdate ? 'update' : 'create'} home update`);
      }
    } catch (err) {
      console.error(`Error ${editingUpdate ? 'updating' : 'creating'} home update:`, err);
      setError(`Failed to ${editingUpdate ? 'update' : 'create'} home update. Please try again later.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this update?')) {
      setActionLoading(true);
      
      try {
        const response = await fetch(`/api/home-updates/${id}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();

        if (data.success) {
          fetchHomeUpdates();
          setError('');
          setSnackbar({
            open: true,
            message: 'Home update successfully deleted',
            severity: 'success'
          });
        } else {
          setError(data.message || 'Failed to delete home update');
        }
      } catch (err) {
        console.error('Error deleting home update:', err);
        setError('Failed to delete home update. Please try again later.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handlePublishToggle = async (update: HomeUpdate) => {
    try {
      const response = await fetch(`/api/home-updates/${update._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...update,
          isPublished: !update.isPublished,
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchHomeUpdates();
      } else {
        setError(data.message || 'Failed to toggle publish status');
      }
    } catch (err) {
      console.error('Error toggling publish status:', err);
      setError('Failed to toggle publish status. Please try again later.');
    }
  };

  const getFilteredUpdates = () => {
    if (filterType === 'all') {
      return homeUpdates;
    }
    return homeUpdates.filter(update => update.type === filterType);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <AnnouncementIcon />;
      case 'news':
        return <NewsIcon />;
      case 'image':
        return <ImageIcon />;
      case 'video':
        return <VideoIcon />;
      default:
        return <AnnouncementIcon />;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)',
          }}
        >
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  if (!session || !session.user?.isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <AdminLayout>
      <Box
        component="main"
        sx={{
          pt: 8,
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)',
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Manage Home Page Updates
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
                },
              }}
              disabled={actionLoading}
            >
              Add Update
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            <Tabs
              value={filterType}
              onChange={(_, newValue) => setFilterType(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                mb: 2,
                '& .MuiTab-root': {
                  color: 'text.secondary',
                },
                '& .Mui-selected': {
                  color: 'primary.main',
                },
              }}
            >
              <Tab 
                label="All" 
                value="all" 
                sx={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: 'center'
                }} 
              />
              <Tab 
                icon={<AnnouncementIcon />} 
                label="Announcements" 
                value="announcement" 
                sx={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: 'center'
                }} 
              />
              <Tab 
                icon={<NewsIcon />} 
                label="News" 
                value="news" 
                sx={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: 'center'
                }} 
              />
              <Tab 
                icon={<ImageIcon />} 
                label="Images" 
                value="image" 
                sx={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: 'center'
                }} 
              />
              <Tab 
                icon={<VideoIcon />} 
                label="Videos" 
                value="video" 
                sx={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: 'center'
                }} 
              />
            </Tabs>
          </Box>

          {getFilteredUpdates().length === 0 ? (
            <Alert severity="info">
              No {filterType === 'all' ? '' : filterType} updates found. Create a new update using the button above.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {getFilteredUpdates().map((update) => (
                <Grid item xs={12} md={6} key={update._id}>
                  <Paper
                    sx={{
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      position: 'relative',
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease-in-out',
                      opacity: update.isPublished ? 1 : 0.7,
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                      },
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box display="flex" alignItems="center" gap={1}>
                        {getTypeIcon(update.type)}
                        <Typography variant="h6" component="h2">
                          {update.title}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton 
                          onClick={() => handleOpenDialog(update)} 
                          sx={{ color: 'primary.main' }}
                          disabled={actionLoading}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => update._id && handleDelete(update._id)} 
                          sx={{ color: 'error.main' }}
                          disabled={actionLoading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="body1" paragraph>
                      {update.content}
                    </Typography>

                    {update.type === 'image' && update.imageUrl && (
                      <Box sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
                        <img 
                          src={update.imageUrl} 
                          alt={update.title} 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '200px', 
                            borderRadius: '4px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }} 
                        />
                      </Box>
                    )}

                    {update.type === 'video' && update.videoUrl && (
                      <Box sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
                        <iframe
                          width="100%"
                          height="200"
                          src={update.videoUrl}
                          title={update.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                        />
                      </Box>
                    )}

                    <Box mt="auto" display="flex" justifyContent="space-between" alignItems="center">
                      <Chip 
                        label={update.type} 
                        size="small" 
                        color={update.isPublished ? "primary" : "default"}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={update.isPublished}
                            onChange={() => handlePublishToggle(update)}
                            color="primary"
                          />
                        }
                        label={update.isPublished ? "Published" : "Draft"}
                      />
                    </Box>
                    
                    {update.createdAt && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 2, display: 'block' }}
                      >
                        Created: {new Date(update.createdAt).toLocaleString()}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle>{editingUpdate ? 'Edit Update' : 'Add Update'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  error={Boolean(formErrors.title)}
                  helperText={formErrors.title}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'text.secondary',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="type-label">Type</InputLabel>
                  <Select
                    labelId="type-label"
                    value={formData.type}
                    label="Type"
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      type: e.target.value as HomeUpdate['type'] 
                    })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                      },
                    }}
                  >
                    <MenuItem value="announcement">Announcement</MenuItem>
                    <MenuItem value="news">News</MenuItem>
                    <MenuItem value="image">Image</MenuItem>
                    <MenuItem value="video">Video</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Content"
                  multiline
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  error={Boolean(formErrors.content)}
                  helperText={formErrors.content}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'text.secondary',
                    },
                  }}
                />
              </Grid>
              
              {formData.type === 'image' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Image URL"
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    required
                    error={Boolean(formErrors.imageUrl)}
                    helperText={formErrors.imageUrl}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'text.secondary',
                      },
                    }}
                  />
                  {formData.imageUrl && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px', 
                          borderRadius: '4px',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }} 
                      />
                    </Box>
                  )}
                </Grid>
              )}
              
              {formData.type === 'video' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Video URL (YouTube Embed)"
                    value={formData.videoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    required
                    error={Boolean(formErrors.videoUrl)}
                    helperText={formErrors.videoUrl || 'Enter YouTube embed URL (e.g., https://www.youtube.com/embed/VIDEO_ID)'}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'text.secondary',
                      },
                    }}
                  />
                  {formData.videoUrl && (
                    <Box sx={{ mt: 2 }}>
                      <iframe
                        width="100%"
                        height="200"
                        src={formData.videoUrl}
                        title="Video Preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                      />
                    </Box>
                  )}
                </Grid>
              )}
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Publish immediately"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={actionLoading}
              sx={{
                background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
                },
              }}
            >
              {actionLoading ? <CircularProgress size={24} /> : (editingUpdate ? 'Update' : 'Add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Footer />
    </AdminLayout>
  );
} 