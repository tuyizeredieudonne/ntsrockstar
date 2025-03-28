import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Grid,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
} from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  CheckCircle,
  AccessTime,
  LocationOn,
  Group,
  MusicNote,
  EmojiEvents,
  TrendingUp,
  Info,
} from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Type for Event Details
interface EventDetailsType {
  name: string;
  location: string;
  date: string;
  endTime: string;
  description: string;
  ticketTypes: Array<{
    name: string;
    price: number;
    discountPrice: number;
    description: string;
    features: string[];
    discountEndTime: string;
  }>;
  momoCode: string;
  momoInstructions: string;
}

// Add type for form values
interface BookingFormValues {
  fullName: string;
  studentLevel: string;
  trade: string;
  phoneNumber: string;
  email: string;
  ticketType: {
    name: string;
    price: number;
  };
  momoTransactionId: string;
  paymentScreenshot: File | null;
}

// Add type for file change handler
interface FileChangeHandler {
  (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any) => void): void;
}

const steps = ['Select Ticket', 'Personal Information', 'Payment Details', 'Confirmation'];

const BookingPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [eventDetails, setEventDetails] = useState<EventDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEventLoading, setIsEventLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<EventDetailsType['ticketTypes'][0] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const theme = useTheme();

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setIsEventLoading(true);
        setError(null);
        const response = await fetch('/api/event-details');
        const data = await response.json();
        
        if (data.success) {
          setEventDetails(data.data);
        } else {
          setError('Failed to load event details. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError('An error occurred while loading event details. Please try again later.');
      } finally {
        setIsEventLoading(false);
      }
    };
    
    fetchEventDetails();
  }, []);

  if (isEventLoading) {
    return (
      <>
        <Header />
        <Box 
          component="main" 
          sx={{ 
            pt: 8,
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)',
          }}
        >
          <CircularProgress size={60} />
        </Box>
        <Footer />
      </>
    );
  }

  if (error && !eventDetails) {
    return (
      <>
        <Header />
        <Box 
          component="main" 
          sx={{ 
            pt: 8,
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)',
          }}
        >
          <Alert severity="error" sx={{ maxWidth: 600, mx: 2 }}>
            {error}
          </Alert>
        </Box>
        <Footer />
      </>
    );
  }

  // Calculate current ticket price
  const getCurrentPrice = (ticketType: EventDetailsType['ticketTypes'][0]) => {
    const now = new Date();
    const discountEndTime = new Date(ticketType.discountEndTime);
    
    if (now < discountEndTime) {
      return ticketType.discountPrice;
    }
    
    return ticketType.price;
  };

  // Update file change handler with proper types
  const handleFileChange: FileChangeHandler = (event, setFieldValue) => {
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      const file = event.currentTarget.files[0];
      setFieldValue('paymentScreenshot', file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    setBookingStatus(null);
    
    try {
      if (!imagePreview) {
        throw new Error('Please upload a payment screenshot');
      }

      // First upload the screenshot to Cloudinary
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          data: imagePreview,
          requireAdmin: false // This is a user upload
        }),
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'Failed to upload payment screenshot');
      }
      
      const uploadData = await uploadResponse.json();
      
      if (!uploadData.success) {
        throw new Error(uploadData.message || 'Failed to upload payment screenshot');
      }
      
      // Now submit the booking with the screenshot URL
      const bookingData = {
        fullName: values.fullName,
        studentLevel: values.studentLevel,
        trade: values.trade,
        phoneNumber: values.phoneNumber,
        email: values.email,
        ticketType: {
          name: values.ticketType.name,
          price: values.ticketType.price
        },
        momoTransactionId: values.momoTransactionId,
        paymentScreenshot: uploadData.url,
        status: 'pending'
      };
      
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        throw new Error(errorData.message || 'Failed to submit booking');
      }
      
      const bookingResult = await bookingResponse.json();
      
      if (bookingResult.success) {
        setBookingStatus({
          success: true,
          message: 'Booking submitted successfully! Your booking is pending approval.',
        });
        setActiveStep(steps.length);
      } else {
        throw new Error(bookingResult.message || 'Failed to submit booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingStatus({
        success: false,
        message: error instanceof Error ? error.message : 'There was an error processing your booking. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Validation schema for booking form
  const validationSchema = Yup.object({
    fullName: Yup.string()
      .required('Full name is required')
      .max(100, 'Full name must be at most 100 characters'),
    studentLevel: Yup.string()
      .required('Student level is required'),
    trade: Yup.string()
      .required('Trade is required'),
    phoneNumber: Yup.string()
      .required('Phone number is required')
      .matches(/^[0-9]+$/, 'Phone number must contain only digits')
      .min(10, 'Phone number must be at least 10 digits'),
    email: Yup.string()
      .required('Email is required')
      .email('Invalid email address'),
    ticketType: Yup.object()
      .required('Ticket type is required'),
    momoTransactionId: Yup.string()
      .required('MoMo transaction ID is required'),
    paymentScreenshot: Yup.mixed()
      .required('Payment screenshot is required'),
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  return (
    <>
      <Head>
        <title>Book Tickets - NTS Rockstar Party</title>
        <meta name="description" content="Book your tickets for the NTS Rockstar Party event" />
      </Head>

      <Header />

      <Box 
        component="main" 
        sx={{ 
          pt: 8,
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(255, 107, 107, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          }
        }}
      >
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{
              fontWeight: 700,
              mb: 6,
              background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Book Your Tickets
          </Typography>

          <Stepper 
            activeStep={activeStep} 
            alternativeLabel
            sx={{ 
              mb: 6,
              '& .MuiStepLabel-label': {
                color: 'text.secondary',
              },
              '& .MuiStepLabel-active': {
                color: 'primary.main',
              },
              '& .MuiStepLabel-completed': {
                color: 'success.main',
              },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {bookingStatus && (
            <Alert 
              severity={bookingStatus.success ? "success" : "error"} 
              sx={{ mb: 4 }}
            >
              {bookingStatus.message}
            </Alert>
          )}

          <Formik
            initialValues={{
              fullName: '',
              studentLevel: '',
              trade: '',
              phoneNumber: '',
              email: '',
              ticketType: { name: '', price: 0 },
              momoTransactionId: '',
              paymentScreenshot: null,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue }) => (
              <Form>
                {activeStep === 0 && (
                  <Zoom in timeout={500}>
                    <Grid container spacing={4}>
                      {eventDetails?.ticketTypes.map((ticket, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Card
                            sx={{
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              background: alpha(theme.palette.background.paper, 0.5),
                              backdropFilter: 'blur(10px)',
                              border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                              transition: 'all 0.3s ease-in-out',
                              cursor: 'pointer',
                              '&:hover': {
                                transform: 'translateY(-5px)',
                                background: alpha(theme.palette.background.paper, 0.8),
                                boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                              },
                              ...(selectedTicket?.name === ticket.name && {
                                borderColor: 'primary.main',
                                boxShadow: '0 0 0 2px rgba(255, 107, 107, 0.5)',
                              }),
                            }}
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setFieldValue('ticketType', { name: ticket.name, price: getCurrentPrice(ticket) });
                            }}
                          >
                            <CardContent sx={{ flexGrow: 1 }}>
                              <Typography variant="h5" component="h2" gutterBottom>
                                {ticket.name}
                              </Typography>
                              <Typography variant="h4" color="primary" gutterBottom>
                                {getCurrentPrice(ticket)} RWF
                              </Typography>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {ticket.description}
                              </Typography>
                              <Stack spacing={1}>
                                {ticket.features.map((feature, idx) => (
                                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircle color="primary" fontSize="small" />
                                    <Typography variant="body2">{feature}</Typography>
                                  </Box>
                                ))}
                              </Stack>
                              {new Date(ticket.discountEndTime) > new Date() && (
                                <Chip
                                  label="Early Bird Discount"
                                  color="secondary"
                                  size="small"
                                  sx={{ mt: 2 }}
                                />
                              )}
                            </CardContent>
                            <CardActions>
                              <Button 
                                size="small" 
                                color="primary"
                                fullWidth
                                variant={selectedTicket?.name === ticket.name ? "contained" : "outlined"}
                                onClick={() => handleNext()}
                              >
                                Select Ticket
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Zoom>
                )}

                {activeStep === 1 && (
                  <Zoom in timeout={500}>
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={6}>
                        <Field
                          name="fullName"
                          as={TextField}
                          label="Full Name"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: alpha(theme.palette.common.white, 0.1),
                              },
                              '&:hover fieldset': {
                                borderColor: alpha(theme.palette.common.white, 0.2),
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'text.secondary',
                            },
                          }}
                        />
                        <ErrorMessage name="fullName" component="div" style={{ color: 'red' }} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Field
                          name="email"
                          as={TextField}
                          label="Email"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: alpha(theme.palette.common.white, 0.1),
                              },
                              '&:hover fieldset': {
                                borderColor: alpha(theme.palette.common.white, 0.2),
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'text.secondary',
                            },
                          }}
                        />
                        <ErrorMessage name="email" component="div" style={{ color: 'red' }} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Field
                          name="studentLevel"
                          as={TextField}
                          label="Student Level"
                          fullWidth
                          select
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: alpha(theme.palette.common.white, 0.1),
                              },
                              '&:hover fieldset': {
                                borderColor: alpha(theme.palette.common.white, 0.2),
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'text.secondary',
                            },
                          }}
                        >
                          
                          <MenuItem value="L3">L3</MenuItem>
                          <MenuItem value="L4">L4</MenuItem>
                          <MenuItem value="L5">L5</MenuItem>
                          
                        </Field>
                        <ErrorMessage name="studentLevel" component="div" style={{ color: 'red' }} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Field
                          name="trade"
                          as={TextField}
                          label="Trade"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: alpha(theme.palette.common.white, 0.1),
                              },
                              '&:hover fieldset': {
                                borderColor: alpha(theme.palette.common.white, 0.2),
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'text.secondary',
                            },
                          }}
                        />
                        <ErrorMessage name="trade" component="div" style={{ color: 'red' }} />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                          <Button
                            variant="outlined"
                            onClick={handleBack}
                            sx={{
                              borderColor: alpha(theme.palette.common.white, 0.1),
                              color: 'text.primary',
                              '&:hover': {
                                borderColor: alpha(theme.palette.common.white, 0.2),
                              },
                            }}
                          >
                            Back
                          </Button>
                          <Button
                            variant="contained"
                            onClick={handleNext}
                            sx={{
                              background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
                              },
                            }}
                          >
                            Next
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Zoom>
                )}

                {activeStep === 2 && (
                  <Zoom in timeout={500}>
                    <Grid container spacing={4}>
                      <Grid item xs={12}>
                        <Paper
                          sx={{
                            p: 3,
                            mb: 4,
                            background: alpha(theme.palette.background.paper, 0.5),
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                          }}
                        >
                          <Typography variant="h6" gutterBottom>
                            Payment Instructions
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {eventDetails?.momoInstructions}
                          </Typography>
                          <Typography variant="body1" color="primary">
                            MoMo Code: {eventDetails?.momoCode}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Field
                          name="momoTransactionId"
                          as={TextField}
                          label="MoMo Transaction ID"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: alpha(theme.palette.common.white, 0.1),
                              },
                              '&:hover fieldset': {
                                borderColor: alpha(theme.palette.common.white, 0.2),
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'text.secondary',
                            },
                          }}
                        />
                        <ErrorMessage name="momoTransactionId" component="div" style={{ color: 'red' }} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Field
                          name="phoneNumber"
                          as={TextField}
                          label="Phone Number"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: alpha(theme.palette.common.white, 0.1),
                              },
                              '&:hover fieldset': {
                                borderColor: alpha(theme.palette.common.white, 0.2),
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'text.secondary',
                            },
                          }}
                        />
                        <ErrorMessage name="phoneNumber" component="div" style={{ color: 'red' }} />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ mt: 2 }}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, setFieldValue)}
                            style={{ display: 'none' }}
                            id="payment-screenshot"
                          />
                          <label htmlFor="payment-screenshot">
                            <Button
                              component="span"
                              variant="outlined"
                              sx={{
                                borderColor: alpha(theme.palette.common.white, 0.1),
                                color: 'text.primary',
                                '&:hover': {
                                  borderColor: alpha(theme.palette.common.white, 0.2),
                                },
                              }}
                            >
                              Upload Payment Screenshot
                            </Button>
                          </label>
                          {imagePreview && (
                            <Box sx={{ mt: 2 }}>
                              <img
                                src={imagePreview}
                                alt="Payment Screenshot Preview"
                                style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                              />
                            </Box>
                          )}
                          <ErrorMessage name="paymentScreenshot" component="div" style={{ color: 'red' }} />
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                          <Button
                            variant="outlined"
                            onClick={handleBack}
                            sx={{
                              borderColor: alpha(theme.palette.common.white, 0.1),
                              color: 'text.primary',
                              '&:hover': {
                                borderColor: alpha(theme.palette.common.white, 0.2),
                              },
                            }}
                          >
                            Back
                          </Button>
                          <Button
                            variant="contained"
                            type="submit"
                            disabled={isLoading}
                            sx={{
                              background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
                              },
                            }}
                          >
                            {isLoading ? <CircularProgress size={24} /> : 'Submit Booking'}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Zoom>
                )}

                {activeStep === 3 && (
                  <Zoom in timeout={500}>
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 8,
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                      <Typography variant="h4" gutterBottom>
                        Booking Submitted Successfully!
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        Your booking is pending approval. We will send you a confirmation email once it's approved.
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => router.push('/')}
                        sx={{
                          background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
                          },
                        }}
                      >
                        Return to Home
                      </Button>
                    </Box>
                  </Zoom>
                )}
              </Form>
            )}
          </Formik>
        </Container>
      </Box>

      <Footer />
    </>
  );
};

export default BookingPage; 