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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface Booking {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  studentLevel: string;
  trade: string;
  event: {
    _id: string;
    name: string;
    date: string;
    location: string;
  };
  ticketType: {
    _id: string;
    name: string;
    price: number;
    discountPrice: number;
    description: string;
    features: string[];
  };
  quantity: number;
  totalAmount: number;
  momoTransactionId: string;
  paymentScreenshot: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  discountApplied: boolean;
  savings: number;
}

const BookingsManagement = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'view' | 'edit' | 'delete'>('view');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/admin/bookings');
        const data = await response.json();
        if (data.success) {
          setBookings(data.data);
        } else {
          setError('Failed to fetch bookings');
        }
      } catch (err) {
        setError('An error occurred while fetching bookings');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === 'admin') {
      fetchBookings();
    }
  }, [session]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      setError(null);
      
      // Show confirmation dialog for important actions
      if (newStatus === 'rejected' || newStatus === 'cancelled') {
        if (!window.confirm(`Are you sure you want to ${newStatus === 'rejected' ? 'reject' : 'cancel'} this booking?`)) {
          return;
        }
      }
      
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setBookings(bookings.map(booking =>
          booking._id === bookingId ? { ...booking, status: newStatus } : booking
        ));
        
        // Show success alert
        alert(`Booking status updated to ${newStatus} successfully`);
      } else {
        setError(data.message || 'Failed to update booking status');
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('An error occurred while updating booking status. Please try again.');
    }
  };

  const handleDialogOpen = (booking: Booking, type: 'view' | 'edit' | 'delete') => {
    setSelectedBooking(booking);
    setActionType(type);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedBooking(null);
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'warning';
    }
  };

  // Add this function to handle booking deletion with confirmation
  const handleDeleteBooking = async (bookingId: string) => {
    try {
      if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
        return;
      }
      
      setError(null);
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        // Remove booking from list
        setBookings(bookings.filter(booking => booking._id !== bookingId));
        setDialogOpen(false);
        alert('Booking deleted successfully');
      } else {
        setError(data.message || 'Failed to delete booking');
      }
    } catch (err) {
      console.error('Error deleting booking:', err);
      setError('An error occurred while deleting the booking. Please try again.');
    }
  };

  // Add a function to filter and sort bookings
  const getFilteredAndSortedBookings = () => {
    let filtered = [...bookings];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(booking => 
        booking.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.ticketType?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking._id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareA = a[sortField];
      let compareB = b[sortField];

      // Handle dates
      if (sortField === 'createdAt') {
        compareA = new Date(compareA).getTime();
        compareB = new Date(compareB).getTime();
      }

      if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
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
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              color: 'white',
              mb: 4,
              fontWeight: 700,
            }}
          >
            Bookings Management
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          {/* Add search and sort controls */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
            <TextField
              fullWidth
              label="Search bookings"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, ticket type, or booking ID"
              sx={{ flexGrow: 1 }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortField}
                label="Sort by"
                onChange={(e) => setSortField(e.target.value)}
              >
                <MenuItem value="createdAt">Date</MenuItem>
                <MenuItem value="fullName">Customer Name</MenuItem>
                <MenuItem value="ticketType">Ticket Type</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Order</InputLabel>
              <Select
                value={sortOrder}
                label="Order"
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {isMobile ? (
            <Stack spacing={3}>
              {getFilteredAndSortedBookings()
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((booking) => (
                  <Card
                    key={booking._id}
                    sx={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6">{booking.fullName}</Typography>
                          <Chip
                            label={booking.status}
                            color={getStatusColor(booking.status)}
                            size="small"
                          />
                        </Box>
                        <Divider />
                        <Typography variant="body2">
                          <strong>Email:</strong> {booking.email}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Phone:</strong> {booking.phoneNumber}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Student Level:</strong> {booking.studentLevel}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Trade:</strong> {booking.trade}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Event:</strong> {booking.event.name}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Event Date:</strong> {new Date(booking.event.date).toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Location:</strong> {booking.event.location}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Ticket Type:</strong> {booking.ticketType.name}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Quantity:</strong> {booking.quantity}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Amount:</strong> GHS {(booking.totalAmount || booking.ticketType?.price || 0).toFixed(2)}
                        </Typography>
                        {booking.discountApplied && (
                          <Typography variant="body2" color="success.main">
                            <strong>Savings:</strong> GHS {booking.savings.toFixed(2)}
                          </Typography>
                        )}
                        <Typography variant="body2">
                          <strong>Transaction ID:</strong> {booking.momoTransactionId}
                        </Typography>
                        {booking.paymentScreenshot && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="primary">
                              <strong>Payment Screenshot:</strong>
                            </Typography>
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'center',
                              p: 1,
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: 1,
                              mt: 1
                            }}>
                              <img
                                src={booking.paymentScreenshot}
                                alt="Payment Screenshot"
                                style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: '150px', 
                                  borderRadius: '4px',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  cursor: 'pointer',
                                  objectFit: 'contain',
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                                }}
                                onError={(e) => {
                                  console.error('Error loading payment screenshot:', e);
                                  e.currentTarget.src = '/images/placeholder.png';
                                }}
                                onClick={() => window.open(booking.paymentScreenshot, '_blank')}
                              />
                            </Box>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleDialogOpen(booking, 'view')}
                            sx={{ color: 'primary.main' }}
                          >
                            <Visibility />
                          </IconButton>
                          {booking.status === 'pending' && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleStatusUpdate(booking._id, 'approved')}
                                sx={{ color: 'success.main' }}
                              >
                                <CheckCircle />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                                sx={{ color: 'error.main' }}
                              >
                                <Cancel />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
            </Stack>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Student Info</TableCell>
                    <TableCell>Event</TableCell>
                    <TableCell>Ticket</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredAndSortedBookings()
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell>{booking.fullName}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{booking.email}</Typography>
                          <Typography variant="body2">{booking.phoneNumber}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">Level: {booking.studentLevel}</Typography>
                          <Typography variant="body2">Trade: {booking.trade}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{booking.event.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(booking.event.date).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{booking.ticketType.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Qty: {booking.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            GHS {(booking.totalAmount || booking.ticketType?.price || 0).toFixed(2)}
                          </Typography>
                          {booking.discountApplied && (
                            <Typography variant="body2" color="success.main">
                              Saved: GHS {booking.savings.toFixed(2)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            ID: {booking.momoTransactionId}
                          </Typography>
                          {booking.paymentScreenshot && (
                            <Box sx={{ mt: 1 }}>
                              <img
                                src={booking.paymentScreenshot}
                                alt="Payment"
                                style={{ 
                                  maxWidth: '100px', 
                                  maxHeight: '50px', 
                                  borderRadius: '4px',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  cursor: 'pointer',
                                  objectFit: 'contain'
                                }}
                                onError={(e) => {
                                  console.error('Error loading payment screenshot:', e);
                                  e.currentTarget.src = '/images/placeholder.png';
                                }}
                                onClick={() => window.open(booking.paymentScreenshot, '_blank')}
                              />
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={booking.status}
                            color={getStatusColor(booking.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={() => handleDialogOpen(booking, 'view')}
                              color="primary"
                            >
                              <Visibility />
                            </IconButton>
                            {booking.status === 'pending' && (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => handleStatusUpdate(booking._id, 'approved')}
                                  color="success"
                                >
                                  <CheckCircle />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                                  color="error"
                                >
                                  <Cancel />
                                </IconButton>
                              </>
                            )}
                            <IconButton
                              size="small"
                              onClick={() => handleDialogOpen(booking, 'delete')}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={getFilteredAndSortedBookings().length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          )}

          {/* Show message when no results found */}
          {getFilteredAndSortedBookings().length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No bookings found matching your search criteria
              </Typography>
            </Box>
          )}
        </Container>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {actionType === 'view' ? 'Booking Details' : 'Delete Booking'}
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Customer Information
                </Typography>
                <Stack spacing={1}>
                  <Typography>Name: {selectedBooking.fullName}</Typography>
                  <Typography>Email: {selectedBooking.email}</Typography>
                  <Typography>Phone: {selectedBooking.phoneNumber}</Typography>
                  <Typography>Student Level: {selectedBooking.studentLevel}</Typography>
                  <Typography>Trade: {selectedBooking.trade}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Booking Information
                </Typography>
                <Stack spacing={1}>
                  <Typography>Event: {selectedBooking.event.name}</Typography>
                  <Typography>Date: {new Date(selectedBooking.event.date).toLocaleString()}</Typography>
                  <Typography>Location: {selectedBooking.event.location}</Typography>
                  <Typography>Ticket: {selectedBooking.ticketType.name}</Typography>
                  <Typography>Quantity: {selectedBooking.quantity}</Typography>
                  <Typography>Amount: GHS {(selectedBooking.totalAmount || selectedBooking.ticketType?.price || 0).toFixed(2)}</Typography>
                  {selectedBooking.discountApplied && (
                    <Typography color="success.main">
                      Savings: GHS {selectedBooking.savings.toFixed(2)}
                    </Typography>
                  )}
                  <Typography>Status: {selectedBooking.status}</Typography>
                  <Typography>
                    Booked: {new Date(selectedBooking.createdAt).toLocaleString()}
                  </Typography>
                  <Typography>Transaction ID: {selectedBooking.momoTransactionId}</Typography>
                </Stack>
              </Grid>
              {selectedBooking.paymentScreenshot && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Payment Screenshot
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    p: 2,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 1
                  }}>
                    <img
                      src={selectedBooking.paymentScreenshot}
                      alt="Payment Screenshot"
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '300px', 
                        objectFit: 'contain',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                      onError={(e) => {
                        console.error('Error loading payment screenshot:', e);
                        e.currentTarget.src = '/images/placeholder.png';
                      }}
                      onClick={() => window.open(selectedBooking.paymentScreenshot, '_blank')}
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
          {actionType === 'delete' && (
            <Button
              color="error"
              onClick={() => selectedBooking && handleDeleteBooking(selectedBooking._id)}
            >
              Delete
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
};

export default BookingsManagement; 