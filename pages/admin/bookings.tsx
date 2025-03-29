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
  ticketType: {
    name: string;
    price: number;
  };
  momoTransactionId: string;
  paymentScreenshot: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
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
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        setBookings(bookings.map(booking =>
          booking._id === bookingId ? { ...booking, status: newStatus } : booking
        ));
      } else {
        setError('Failed to update booking status');
      }
    } catch (err) {
      setError('An error occurred while updating booking status');
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
              fontWeight: 700,
              mb: 4,
              background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Bookings Management
          </Typography>

          {isMobile ? (
            <Stack spacing={3}>
              {bookings
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
                          <strong>Ticket Type:</strong> {booking.ticketType?.name || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Amount:</strong> {booking.ticketType?.price ? `${booking.ticketType.price} RWF` : 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Transaction ID:</strong> {booking.momoTransactionId}
                        </Typography>
                        {booking.paymentScreenshot && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="primary">
                              <strong>Payment Screenshot:</strong>
                            </Typography>
                            <img
                              src={booking.paymentScreenshot}
                              alt="Payment Screenshot"
                              style={{ 
                                maxWidth: '100%', 
                                maxHeight: '150px', 
                                borderRadius: '4px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                cursor: 'pointer'
                              }}
                              onClick={() => window.open(booking.paymentScreenshot, '_blank')}
                            />
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
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Student Level</TableCell>
                    <TableCell>Trade</TableCell>
                    <TableCell>Ticket Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell>{booking.fullName}</TableCell>
                        <TableCell>{booking.email}</TableCell>
                        <TableCell>{booking.phoneNumber}</TableCell>
                        <TableCell>{booking.studentLevel}</TableCell>
                        <TableCell>{booking.trade}</TableCell>
                        <TableCell>{booking.ticketType?.name || 'N/A'}</TableCell>
                        <TableCell>{booking.ticketType?.price ? `${booking.ticketType.price} RWF` : 'N/A'}</TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              maxWidth: '150px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {booking.momoTransactionId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {booking.paymentScreenshot && (
                            <img
                              src={booking.paymentScreenshot}
                              alt="Payment Screenshot"
                              style={{ 
                                maxWidth: '100px', 
                                maxHeight: '50px', 
                                borderRadius: '4px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                cursor: 'pointer'
                              }}
                              onClick={() => window.open(booking.paymentScreenshot, '_blank')}
                            />
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
                          <Box sx={{ display: 'flex', gap: 1 }}>
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
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            component="div"
            count={bookings.length}
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
        {selectedBooking && (
          <>
            <DialogTitle>
              {actionType === 'view' && 'Booking Details'}
              {actionType === 'edit' && 'Edit Booking'}
              {actionType === 'delete' && 'Delete Booking'}
            </DialogTitle>
            <DialogContent>
              {actionType === 'view' && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Personal Information
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Name:</strong> {selectedBooking.fullName}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Email:</strong> {selectedBooking.email}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Phone:</strong> {selectedBooking.phoneNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Booking Details
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Student Level:</strong> {selectedBooking.studentLevel}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Trade:</strong> {selectedBooking.trade}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Ticket Type:</strong> {selectedBooking.ticketType?.name || 'N/A'}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Amount:</strong> {selectedBooking.ticketType?.price ? `${selectedBooking.ticketType.price} RWF` : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        Payment Information
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>MoMo Transaction ID:</strong> {selectedBooking.momoTransactionId}
                      </Typography>
                      {selectedBooking.paymentScreenshot && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" paragraph>
                            <strong>Payment Screenshot:</strong>
                          </Typography>
                          <img
                            src={selectedBooking.paymentScreenshot}
                            alt="Payment Screenshot"
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '400px', 
                              borderRadius: '4px',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              cursor: 'pointer'
                            }}
                            onClick={() => window.open(selectedBooking.paymentScreenshot, '_blank')}
                          />
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Footer />
    </>
  );
};

export default BookingsManagement; 