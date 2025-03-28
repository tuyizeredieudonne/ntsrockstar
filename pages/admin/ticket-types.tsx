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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
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
  OutlinedInput,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Snackbar
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface TicketTypeData {
  _id?: string;
  name: string;
  price: number;
  discountPrice?: number;
  description: string;
  features: string[];
  discountEndTime?: string;
  isActive: boolean;
  maxQuantity: number;
  soldQuantity: number;
}

interface FormErrors {
  name?: string;
  price?: string;
  description?: string;
  features?: string;
  discountPrice?: string;
  discountEndTime?: string;
  maxQuantity?: string;
}

export default function TicketTypes() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [ticketTypes, setTicketTypes] = useState<TicketTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketTypeData | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [featuresInput, setFeaturesInput] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const [formData, setFormData] = useState<TicketTypeData>({
    name: '',
    price: 0,
    discountPrice: 0,
    description: '',
    features: [],
    discountEndTime: '',
    isActive: true,
    maxQuantity: 100,
    soldQuantity: 0
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchTicketTypes();
    }
  }, [status, session]);

  const fetchTicketTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ticket-types');
      const data = await response.json();
      
      if (data.success) {
        setTicketTypes(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch ticket types');
      }
    } catch (err) {
      console.error('Error fetching ticket types:', err);
      setError('Failed to fetch ticket types. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (ticketType?: TicketTypeData) => {
    if (ticketType) {
      setEditingTicket(ticketType);
      setFormData({
        ...ticketType,
        discountEndTime: ticketType.discountEndTime 
          ? new Date(ticketType.discountEndTime).toISOString().split('T')[0] 
          : ''
      });
      setFeaturesInput(ticketType.features.join('\n'));
    } else {
      setEditingTicket(null);
      setFormData({
        name: '',
        price: 0,
        discountPrice: 0,
        description: '',
        features: [],
        discountEndTime: '',
        isActive: true,
        maxQuantity: 100,
        soldQuantity: 0
      });
      setFeaturesInput('');
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const validateForm = () => {
    const errors: FormErrors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (formData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (formData.discountPrice !== undefined && formData.discountPrice < 0) {
      errors.discountPrice = 'Discount price cannot be negative';
    }
    
    if (formData.maxQuantity <= 0) {
      errors.maxQuantity = 'Maximum quantity must be greater than 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    // Parse features from textarea
    const features = featuresInput.split('\n')
      .map(feature => feature.trim())
      .filter(feature => feature.length > 0);

    try {
      setActionLoading(true);
      const url = editingTicket 
        ? `/api/ticket-types/${editingTicket._id}`
        : '/api/ticket-types';
      
      const method = editingTicket ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          features
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSnackbar({
          open: true,
          message: `Ticket type ${editingTicket ? 'updated' : 'created'} successfully`,
          severity: 'success'
        });
        handleCloseDialog();
        fetchTicketTypes();
      } else {
        setSnackbar({
          open: true,
          message: data.message || `Failed to ${editingTicket ? 'update' : 'create'} ticket type`,
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error saving ticket type:', err);
      setSnackbar({
        open: true,
        message: `Failed to ${editingTicket ? 'update' : 'create'} ticket type`,
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ticket type?')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/ticket-types/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setSnackbar({
          open: true,
          message: 'Ticket type deleted successfully',
          severity: 'success'
        });
        fetchTicketTypes();
      } else {
        setSnackbar({
          open: true,
          message: data.message || 'Failed to delete ticket type',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error deleting ticket type:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete ticket type',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (ticketType: TicketTypeData) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/ticket-types/${ticketType._id}/toggle-active`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !ticketType.isActive }),
      });

      const data = await response.json();

      if (data.success) {
        setSnackbar({
          open: true,
          message: `Ticket type ${ticketType.isActive ? 'deactivated' : 'activated'} successfully`,
          severity: 'success'
        });
        fetchTicketTypes();
      } else {
        setSnackbar({
          open: true,
          message: data.message || `Failed to ${ticketType.isActive ? 'deactivate' : 'activate'} ticket type`,
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error toggling ticket type status:', err);
      setSnackbar({
        open: true,
        message: `Failed to ${ticketType.isActive ? 'deactivate' : 'activate'} ticket type`,
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
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
              Manage Ticket Types
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
              Add Ticket Type
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {ticketTypes.length === 0 ? (
            <Alert severity="info">
              No ticket types found. Create your first ticket type using the button above.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Discount Price</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Sold</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ticketTypes.map((ticket) => (
                    <TableRow key={ticket._id}>
                      <TableCell>{ticket.name}</TableCell>
                      <TableCell>{ticket.price} RWF</TableCell>
                      <TableCell>
                        {ticket.discountPrice ? `${ticket.discountPrice} RWF` : 'N/A'}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ticket.description}
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={ticket.isActive}
                              onChange={() => handleToggleActive(ticket)}
                              disabled={actionLoading}
                            />
                          }
                          label={ticket.isActive ? 'Active' : 'Inactive'}
                        />
                      </TableCell>
                      <TableCell>
                        {ticket.soldQuantity} / {ticket.maxQuantity}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(ticket)}
                          disabled={actionLoading}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => ticket._id && handleDelete(ticket._id)}
                          disabled={actionLoading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
        <DialogTitle>{editingTicket ? 'Edit Ticket Type' : 'Add Ticket Type'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!formErrors.price}>
                  <InputLabel>Price</InputLabel>
                  <OutlinedInput
                    type="number"
                    label="Price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    endAdornment={<InputAdornment position="end">RWF</InputAdornment>}
                  />
                  {formErrors.price && (
                    <Typography variant="caption" color="error">
                      {formErrors.price}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!formErrors.discountPrice}>
                  <InputLabel>Discount Price (Optional)</InputLabel>
                  <OutlinedInput
                    type="number"
                    label="Discount Price (Optional)"
                    value={formData.discountPrice || ''}
                    onChange={(e) => setFormData({ ...formData, discountPrice: Number(e.target.value) || undefined })}
                    endAdornment={<InputAdornment position="end">RWF</InputAdornment>}
                  />
                  {formErrors.discountPrice && (
                    <Typography variant="caption" color="error">
                      {formErrors.discountPrice}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Features (one per line)"
                  multiline
                  rows={4}
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  placeholder="Enter one feature per line"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Discount End Date (Optional)"
                  type="date"
                  value={formData.discountEndTime || ''}
                  onChange={(e) => setFormData({ ...formData, discountEndTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Maximum Quantity"
                  type="number"
                  value={formData.maxQuantity}
                  onChange={(e) => setFormData({ ...formData, maxQuantity: Number(e.target.value) })}
                  error={!!formErrors.maxQuantity}
                  helperText={formErrors.maxQuantity}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Active"
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
              {actionLoading ? <CircularProgress size={24} /> : (editingTicket ? 'Update' : 'Add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Footer />
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
    </>
  );
} 