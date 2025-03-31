import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Snackbar,
  useTheme,
  alpha,
  IconButton,
  Stack,
} from '@mui/material';
import { Facebook, Twitter, Instagram } from '@mui/icons-material';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

const initialFormData = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

export default function Contact() {
  const [formData, setFormData] = useState(initialFormData);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();

  useEffect(() => {
    const savedFormData = localStorage.getItem('contactFormData');
    if (savedFormData) setFormData(JSON.parse(savedFormData));
  }, []);

  useEffect(() => {
    localStorage.setItem('contactFormData', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSnackbar({ open: true, message: 'Message stored successfully!', severity: 'success' });
    setFormData(initialFormData);
    localStorage.removeItem('contactFormData');
  };

  return (
    <>
      <Head>
        <title>Contact Us</title>
      </Head>
      <Header />
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h3" align="center" gutterBottom>Contact Us</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} sx={{ mb: 2 }} />
                <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} sx={{ mb: 2 }} />
                <TextField fullWidth label="Subject" name="subject" value={formData.subject} onChange={handleChange} sx={{ mb: 2 }} />
                <TextField fullWidth label="Message" name="message" multiline rows={4} value={formData.message} onChange={handleChange} sx={{ mb: 2 }} />
                <Button type="submit" variant="contained" color="primary" fullWidth>Send</Button>
              </form>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h6">Follow Us</Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <IconButton color="primary"><Facebook /></IconButton>
                <IconButton color="primary"><Twitter /></IconButton>
                <IconButton color="primary"><Instagram /></IconButton>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Snackbar open={snackbar.open} message={snackbar.message} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} />
      <Footer />
    </>
  );
}
