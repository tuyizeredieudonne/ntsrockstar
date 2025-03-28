import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  Facebook,
  Twitter,
  Instagram,
  WhatsApp,
} from '@mui/icons-material';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const initialFormData: ContactFormData = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const theme = useTheme();

  // Load form data from localStorage on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('contactFormData');
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('contactFormData', JSON.stringify(formData));
  }, [formData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Here you would typically send the form data to your backend
      // For now, we'll just simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSnackbar({
        open: true,
        message: 'Message sent successfully! We will get back to you soon.',
        severity: 'success',
      });

      // Clear form data and localStorage
      setFormData(initialFormData);
      localStorage.removeItem('contactFormData');
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to send message. Please try again later.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Head>
        <title>Contact Us - NTS Rockstar Party</title>
        <meta name="description" content="Get in touch with us for any questions about the NTS Rockstar Party event" />
      </Head>

      <Header />

      <Box
        component="main"
        sx={{
          minHeight: '100vh',
          pt: 8,
          pb: 6,
          background: 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)',
        }}
      >
        <Container maxWidth="lg">
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
            Contact Us
          </Typography>

          <Grid container spacing={4}>
            {/* Contact Information */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: '100%',
                  background: alpha(theme.palette.background.paper, 0.5),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    background: alpha(theme.palette.background.paper, 0.8),
                  }
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Get in Touch
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1, color: 'primary.main' }}>
                      Address
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Nyanza TSS
                      <br />
                      Southern Province, Rwanda
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1, color: 'primary.main' }}>
                      Phone
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      +250 788 123 456
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1, color: 'primary.main' }}>
                      Email
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      info@ntsrockstar.com
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1, color: 'primary.main' }}>
                      Social Media
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <IconButton 
                        color="primary"
                        sx={{ 
                          '&:hover': { 
                            background: alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                      >
                        <Facebook />
                      </IconButton>
                      <IconButton 
                        color="primary"
                        sx={{ 
                          '&:hover': { 
                            background: alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                      >
                        <Twitter />
                      </IconButton>
                      <IconButton 
                        color="primary"
                        sx={{ 
                          '&:hover': { 
                            background: alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                      >
                        <Instagram />
                      </IconButton>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Contact Form */}
            <Grid item xs={12} md={8}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  background: alpha(theme.palette.background.paper, 0.5),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                }}
              >
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Name"
                        value={formData.name}
                        onChange={handleChange}
                        error={!!errors.name}
                        helperText={errors.name}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: alpha(theme.palette.common.white, 0.05),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.common.white, 0.08),
                            },
                            '&.Mui-focused': {
                              backgroundColor: alpha(theme.palette.common.white, 0.1),
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'text.secondary',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: alpha(theme.palette.common.white, 0.05),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.common.white, 0.08),
                            },
                            '&.Mui-focused': {
                              backgroundColor: alpha(theme.palette.common.white, 0.1),
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
                        label="Subject"
                        value={formData.subject}
                        onChange={handleChange}
                        error={!!errors.subject}
                        helperText={errors.subject}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: alpha(theme.palette.common.white, 0.05),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.common.white, 0.08),
                            },
                            '&.Mui-focused': {
                              backgroundColor: alpha(theme.palette.common.white, 0.1),
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
                        label="Message"
                        multiline
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        error={!!errors.message}
                        helperText={errors.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: alpha(theme.palette.common.white, 0.05),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.common.white, 0.08),
                            },
                            '&.Mui-focused': {
                              backgroundColor: alpha(theme.palette.common.white, 0.1),
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'text.secondary',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={snackbar.open}
                        sx={{
                          py: 1.5,
                          background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
                            boxShadow: '0 4px 20px rgba(255, 107, 107, 0.3)',
                          },
                        }}
                      >
                        {snackbar.open ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Footer />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
} 