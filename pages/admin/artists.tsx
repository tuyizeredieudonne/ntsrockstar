import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface Artist {
  _id: string;
  name: string;
  description: string;
  image: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  createdAt: string;
}

const ArtistsManagement = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'add' | 'edit' | 'delete'>('add');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    socialLinks: {
      instagram: '',
      twitter: '',
      facebook: '',
    },
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await fetch('/api/admin/artists');
        const data = await response.json();
        if (data.success) {
          setArtists(data.data);
        } else {
          setError('Failed to fetch artists');
        }
      } catch (err) {
        setError('An error occurred while fetching artists');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === 'admin') {
      fetchArtists();
    }
  }, [session]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDialogOpen = (artist: Artist | null, type: 'add' | 'edit' | 'delete') => {
    setActionType(type);
    if (artist) {
      setSelectedArtist(artist);
      setFormData({
        name: artist.name,
        description: artist.description,
        image: artist.image,
        socialLinks: artist.socialLinks,
      });
    } else {
      setSelectedArtist(null);
      setFormData({
        name: '',
        description: '',
        image: '',
        socialLinks: {
          instagram: '',
          twitter: '',
          facebook: '',
        },
      });
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedArtist(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      socialLinks: {
        instagram: '',
        twitter: '',
        facebook: '',
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const url = actionType === 'add' ? '/api/admin/artists' : `/api/admin/artists/${selectedArtist?._id}`;
      const method = actionType === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        if (actionType === 'add') {
          setArtists([...artists, data.data]);
        } else if (actionType === 'edit') {
          setArtists(artists.map(artist =>
            artist._id === selectedArtist?._id ? data.data : artist
          ));
        } else if (actionType === 'delete') {
          setArtists(artists.filter(artist => artist._id !== selectedArtist?._id));
        }
        handleDialogClose();
      } else {
        setError('Failed to perform action');
      }
    } catch (err) {
      setError('An error occurred while performing the action');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;

        // Upload to Cloudinary
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: base64Data }),
        });

        const data = await response.json();
        if (data.success) {
          setFormData(prev => ({ ...prev, image: data.url }));
          setImagePreview(data.url);
        } else {
          setError(data.message || 'Failed to upload image');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
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
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)',
          }}
        >
          <Alert severity="error">{error}</Alert>
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Box
        component="main"
        sx={{
          pt: 8,
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)',
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
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
              Artists Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleDialogOpen(null, 'add')}
              sx={{
                background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
                },
              }}
            >
              Add Artist
            </Button>
          </Box>

          {isMobile ? (
            <Stack spacing={3}>
              {artists
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((artist) => (
                  <Card
                    key={artist._id}
                    sx={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6">{artist.name}</Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleDialogOpen(artist, 'edit')}
                              sx={{ color: 'primary.main' }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDialogOpen(artist, 'delete')}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                        <Divider />
                        <Typography variant="body2">{artist.description}</Typography>
                        {artist.image && (
                          <Box sx={{ mt: 2 }}>
                            <img
                              src={artist.image}
                              alt={artist.name}
                              style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                            />
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                          {artist.socialLinks.instagram && (
                            <Typography variant="body2">
                              <strong>Instagram:</strong> {artist.socialLinks.instagram}
                            </Typography>
                          )}
                          {artist.socialLinks.twitter && (
                            <Typography variant="body2">
                              <strong>Twitter:</strong> {artist.socialLinks.twitter}
                            </Typography>
                          )}
                          {artist.socialLinks.facebook && (
                            <Typography variant="body2">
                              <strong>Facebook:</strong> {artist.socialLinks.facebook}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
            </Stack>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Image</TableCell>
                    <TableCell>Social Links</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {artists
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((artist) => (
                      <TableRow key={artist._id}>
                        <TableCell>{artist.name}</TableCell>
                        <TableCell>{artist.description}</TableCell>
                        <TableCell>
                          {artist.image && (
                            <img
                              src={artist.image}
                              alt={artist.name}
                              style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px' }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Stack spacing={1}>
                            {artist.socialLinks.instagram && (
                              <Typography variant="body2">
                                Instagram: {artist.socialLinks.instagram}
                              </Typography>
                            )}
                            {artist.socialLinks.twitter && (
                              <Typography variant="body2">
                                Twitter: {artist.socialLinks.twitter}
                              </Typography>
                            )}
                            {artist.socialLinks.facebook && (
                              <Typography variant="body2">
                                Facebook: {artist.socialLinks.facebook}
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleDialogOpen(artist, 'edit')}
                              sx={{ color: 'primary.main' }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDialogOpen(artist, 'delete')}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            component="div"
            count={artists.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              color: 'text.primary',
              '.MuiTablePagination-select': {
                color: 'text.primary',
              },
            }}
          />
        </Container>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
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
        <DialogTitle>
          {actionType === 'add' && 'Add New Artist'}
          {actionType === 'edit' && 'Edit Artist'}
          {actionType === 'delete' && 'Delete Artist'}
        </DialogTitle>
        <DialogContent>
          {actionType !== 'delete' ? (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle1">Artist Image</Typography>
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="artist-image-upload"
                    />
                    <label htmlFor="artist-image-upload">
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        <Typography variant="body1">
                          {imagePreview ? 'Change Image' : 'Click to upload image'}
                        </Typography>
                      </Box>
                    </label>
                  </Box>
                  {imagePreview && (
                    <Box sx={{ mt: 2 }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: '4px',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  )}
                  {isUploading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Instagram"
                  value={formData.socialLinks.instagram}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, instagram: e.target.value },
                    })
                  }
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
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Twitter"
                  value={formData.socialLinks.twitter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                    })
                  }
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
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Facebook"
                  value={formData.socialLinks.facebook}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, facebook: e.target.value },
                    })
                  }
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
            </Grid>
          ) : (
            <Typography>
              Are you sure you want to delete {selectedArtist?.name}? This action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color={actionType === 'delete' ? 'error' : 'primary'}
            sx={{
              background: actionType === 'delete'
                ? 'linear-gradient(45deg, #FF3D00 30%, #FF6E40 90%)'
                : 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
              '&:hover': {
                background: actionType === 'delete'
                  ? 'linear-gradient(45deg, #FF6E40 30%, #FF3D00 90%)'
                  : 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
              },
            }}
          >
            {actionType === 'add' ? 'Add' : actionType === 'edit' ? 'Save' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
};

export default ArtistsManagement; 