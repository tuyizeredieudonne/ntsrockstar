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
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // ... rest of the component (render method) ...
} 