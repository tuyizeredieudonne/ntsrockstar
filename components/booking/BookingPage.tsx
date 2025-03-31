import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  CircularProgress,
  alpha,
  useTheme
} from '@mui/material';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Header from '../Header';
import Footer from '../Footer';
import TicketSelection from './TicketSelection';
import BookingForm from './BookingForm';

// Define event details type
interface EventDetailsType {
  _id: string;
  name: string;
  location: string;
  date: string;
  endTime: string;
  description: string;
  ticketTypes: Array<{
    _id: string;
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

// Define ticket type
interface TicketType {
  _id: string;
  name: string;
  price: number;
  discountPrice: number;
  description: string;
  features: string[];
  discountEndTime: string;
}

// Define steps in the booking process
const steps = ['Select Ticket', 'Complete Booking'];

const BookingPage: React.FC = () => {
  const { data: session, status } = useSession();
  const [activeStep, setActiveStep] = useState(0);
  const [eventDetails, setEventDetails] = useState<EventDetailsType | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const theme = useTheme();

  // Check if user is authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?returnUrl=/booking');
    }
  }, [status, router]);

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/event-details');
        const data = await response.json();
        
        if (data.success) {
          console.log('Fetched event details:', JSON.stringify(data.data));
          console.log('Ticket types:', JSON.stringify(data.data.ticketTypes));
          
          // Validate ticket types have IDs
          data.data.ticketTypes.forEach((ticket: any, index: number) => {
            if (!ticket._id) {
              console.error(`Ticket at index ${index} is missing _id:`, ticket);
            }
          });
          
          setEventDetails(data.data);
        } else {
          setError('Failed to load event details. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError('An error occurred while loading event details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEventDetails();
  }, []);

  // Handle ticket selection
  const handleSelectTicket = (ticket: TicketType) => {
    console.log('BookingPage received ticket:', JSON.stringify(ticket));
    
    // Validate incoming ticket object
    if (!ticket) {
      console.error('Null or undefined ticket received');
      setError('Invalid ticket data. Please try selecting a different ticket.');
      return;
    }
    
    // Validate the ticket ID specifically
    if (!ticket._id) {
      console.error('Ticket has no ID property:', ticket);
      setError('Selected ticket has no ID. Please try selecting a different ticket.');
      return;
    }
    
    // Create a clean copy with a validated ID
    const validatedTicket = {
      ...ticket,
      _id: String(ticket._id).trim()
    };
    
    // Final validation check
    if (!validatedTicket._id || validatedTicket._id === 'undefined' || validatedTicket._id === 'null') {
      console.error('Invalid ticket ID after validation:', validatedTicket._id);
      setError('Invalid ticket ID. Please try selecting a different ticket.');
      return;
    }
    
    console.log('Setting selected ticket with validated ID:', validatedTicket._id);
    setSelectedTicket(validatedTicket);
    setError(null);
  };

  // Calculate current ticket price based on discount period
  const getCurrentPrice = (ticket: TicketType | null): number => {
    if (!ticket) return 0;
    
    const now = new Date();
    const discountEndTime = new Date(ticket.discountEndTime);
    
    if (now < discountEndTime) {
      return Number(ticket.discountPrice) || 0;
    }
    
    return Number(ticket.price) || 0;
  };

  // Handle next step
  const handleNext = () => {
    if (activeStep === 0) {
      if (!selectedTicket) {
        setError('Please select a ticket before proceeding');
        return;
      }
      
      // Validate the ticket ID
      if (!selectedTicket._id || selectedTicket._id === 'undefined' || selectedTicket._id === 'null') {
        console.error('Invalid ticket ID in handleNext:', selectedTicket);
        setError('Invalid ticket selection. Please select a ticket again.');
        return;
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
    setError(null);
  };

  // Handle going back
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  // Handle booking success
  const handleBookingSuccess = () => {
    setSuccess('Your booking has been submitted successfully!');
    setActiveStep(2); // Move to success step
  };

  // Handle booking error
  const handleBookingError = (message: string) => {
    setError(message);
  };

  // Loading state
  if (isLoading) {
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

  // Error state
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

  return (
    <>
      <Head>
        <title>Book Tickets - Event Booking</title>
        <meta name="description" content="Book your tickets for the upcoming event" />
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

          {/* Stepper */}
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel
            sx={{ mb: 6 }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Error/Success Messages */}
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 4 }}>
              {success}
            </Alert>
          )}

          {/* Step 1: Ticket Selection */}
          {activeStep === 0 && eventDetails && (
            <>
              <TicketSelection 
                tickets={eventDetails.ticketTypes}
                selectedTicketId={selectedTicket?._id || null}
                onSelectTicket={handleSelectTicket}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!selectedTicket}
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
            </>
          )}

          {/* Step 2: Booking Form */}
          {activeStep === 1 && selectedTicket && eventDetails && (
            <>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>Complete Your Booking</Typography>
                
                <Typography variant="body1" paragraph>
                  {eventDetails.momoInstructions}
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body1" fontWeight="bold">
                    MoMo Code: 0791786228
                  </Typography>
                </Alert>
              </Box>
              
              {/* Validate ticket ID before rendering BookingForm */}
              {selectedTicket._id ? (
                <BookingForm 
                  eventId={eventDetails._id}
                  ticketId={selectedTicket._id}
                  ticketName={selectedTicket.name}
                  ticketPrice={getCurrentPrice(selectedTicket)}
                  onSuccess={handleBookingSuccess}
                  onError={handleBookingError}
                />
              ) : (
                <Alert severity="error" sx={{ mb: 4 }}>
                  Invalid ticket selection. Please go back and select a ticket again.
                </Alert>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  sx={{
                    borderColor: alpha(theme.palette.common.white, 0.1),
                    color: 'text.primary',
                  }}
                >
                  Back to Ticket Selection
                </Button>
              </Box>
            </>
          )}

          {/* Step 3: Success */}
          {activeStep === 2 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
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
          )}
        </Container>
      </Box>

      <Footer />
    </>
  );
};

export default BookingPage; 
