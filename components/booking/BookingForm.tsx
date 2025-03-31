import React, { useState } from 'react';
import {
  Button,
  Box,
  Grid,
  TextField,
  Paper,
  Typography,
  MenuItem,
  CircularProgress,
  alpha,
  Alert,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Types
interface BookingFormProps {
  eventId: string;
  ticketId: string;
  ticketName: string;
  ticketPrice: number;
  onSuccess: () => void;
  onError: (message: string) => void;
}

// Form validation schema
const bookingValidationSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Full name is required')
    .max(100, 'Name cannot be more than 100 characters'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9+]{10,12}$/, 'Please enter a valid phone number'),
  studentLevel: Yup.string()
    .required('Student level is required')
    .oneOf(['L3', 'L4', 'L5'], 'Invalid student level'),
  trade: Yup.string()
    .required('Trade is required')
    .min(2, 'Trade must be at least 2 characters')
    .max(50, 'Trade cannot be more than 50 characters'),
  momoTransactionId: Yup.string()
    .required('Mobile Money Transaction ID is required')
    .min(10, 'Transaction ID must be at least 10 characters'),
  paymentScreenshot: Yup.string()
    .required('Payment screenshot is required')
    .url('Invalid payment screenshot URL')
});

const BookingForm: React.FC<BookingFormProps> = ({
  eventId,
  ticketId,
  ticketName,
  ticketPrice,
  onSuccess,
  onError
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const optimizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          const maxSize = 800;
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with reduced quality
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(base64);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any) => void) => {
    setErrorMessage(null);
    
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      const file = event.currentTarget.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please upload an image file (JPEG, PNG, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size should be less than 5MB');
        return;
      }

      try {
        // Optimize the image before upload
        const optimizedBase64 = await optimizeImage(file);
        setImagePreview(optimizedBase64);

        try {
          // Upload to server with increased timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: optimizedBase64 }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to upload image');
          }

          if (!data.success) {
            throw new Error(data.message || 'Upload failed');
          }

          if (!data.url) {
            throw new Error('No URL returned from upload');
          }

          // Store the Cloudinary URL
          setFieldValue('paymentScreenshot', data.url);
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          setErrorMessage(uploadError instanceof Error ? uploadError.message : 'Failed to upload image');
          setImagePreview(null);
          setFieldValue('paymentScreenshot', '');
        }
      } catch (error) {
        console.error('File processing error:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Error processing file');
        setImagePreview(null);
        setFieldValue('paymentScreenshot', '');
      }
    }
  };

  // Submit form
  const submitForm = async (values: any) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      
      if (!values.momoTransactionId || !values.paymentScreenshot) {
        throw new Error('Payment transaction ID and screenshot are required');
      }

      // Create booking data
      const bookingData = {
        event: eventId,
        ticketType: ticketId,
        totalAmount: ticketPrice,
        momoTransactionId: values.momoTransactionId,
        fullName: values.fullName || '',
        email: values.email || '',
        phoneNumber: values.phoneNumber || '',
        studentLevel: values.studentLevel || '',
        trade: values.trade || '',
        paymentScreenshot: values.paymentScreenshot
      };
      
      // Create booking
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit booking');
      }
      
      onSuccess();
      
    } catch (error) {
      console.error('Booking submission error:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrorMessage(message);
      onError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{
        fullName: '',
        email: '',
        phoneNumber: '',
        studentLevel: '',
        trade: '',
        momoTransactionId: '',
        paymentScreenshot: null
      }}
      validationSchema={bookingValidationSchema}
      onSubmit={submitForm}
    >
      {({ setFieldValue, errors, touched }) => (
        <Form>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <Typography variant="h6" gutterBottom>Selected Ticket</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">{ticketName}</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    RF {ticketPrice.toFixed(2)}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Field
                name="fullName"
                as={TextField}
                label="Full Name"
                fullWidth
                required
                error={touched.fullName && Boolean(errors.fullName)}
                helperText={touched.fullName && errors.fullName}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Field
                name="email"
                as={TextField}
                label="Email"
                fullWidth
                required
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Field
                name="studentLevel"
                as={TextField}
                label="Student Level"
                fullWidth
                select
                required
                error={touched.studentLevel && Boolean(errors.studentLevel)}
                helperText={touched.studentLevel && errors.studentLevel}
              >
                <MenuItem value="L3">L3</MenuItem>
                <MenuItem value="L4">L4</MenuItem>
                <MenuItem value="L5">L5</MenuItem>
              </Field>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Field
                name="trade"
                as={TextField}
                label="Trade"
                fullWidth
                required
                error={touched.trade && Boolean(errors.trade)}
                helperText={touched.trade && errors.trade}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Field
                name="phoneNumber"
                as={TextField}
                label="Phone Number"
                fullWidth
                required
                error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                helperText={touched.phoneNumber && errors.phoneNumber}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Field
                name="momoTransactionId"
                as={TextField}
                label="MoMo Transaction ID"
                fullWidth
                required
                error={touched.momoTransactionId && Boolean(errors.momoTransactionId)}
                helperText={touched.momoTransactionId && errors.momoTransactionId}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Payment Screenshot
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setFieldValue)}
                  style={{ display: 'none' }}
                  id="payment-screenshot"
                  name="paymentScreenshot"
                />
                <label htmlFor="payment-screenshot">
                  <Button
                    component="span"
                    variant="outlined"
                    sx={{
                      borderColor: alpha('#ffffff', 0.2),
                      color: 'text.primary',
                    }}
                  >
                    Upload Payment Screenshot
                  </Button>
                </label>
                {touched.paymentScreenshot && errors.paymentScreenshot && (
                  <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
                    {errors.paymentScreenshot as string}
                  </Typography>
                )}
                {imagePreview && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={imagePreview}
                      alt="Payment Screenshot Preview"
                      style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                    />
                  </Box>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
                sx={{
                  background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                  py: 1.5,
                }}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Submit Booking'}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default BookingForm; 