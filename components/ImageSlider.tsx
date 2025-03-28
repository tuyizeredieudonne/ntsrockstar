import React, { useState, useEffect } from 'react';
import { Box, Paper, IconButton, Fade, Typography, Grid, useTheme, useMediaQuery } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import CountdownTimer from './CountdownTimer';

interface ImageSliderProps {
  images?: {
    src: string;
    alt: string;
  }[];
  eventDate?: Date;
}

const defaultImages = [
  {
    src: '/images/rock1.png',
    alt: 'Concert Image 1'
  },
  {
    src: '/images/rock2.png',
    alt: 'Concert Image 2'
  },
  {
    src: '/images/rock3.png',
    alt: 'Concert Image 3'
  }
];

export default function ImageSlider({ images = defaultImages, eventDate }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (!images || images.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [images]);

  const handlePrevious = () => {
    if (!images || images.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    if (!images || images.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  if (!images || images.length === 0) {
    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: '300px', md: '500px' },
          overflow: 'hidden',
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No images available
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 'auto', md: '500px' },
        overflow: 'hidden',
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Grid container spacing={{ xs: 2, md: 0 }} sx={{ height: '100%' }}>
        {/* Left side - Image Slider */}
        <Grid item xs={12} md={7} sx={{ height: { xs: '300px', md: '100%' } }}>
          <Fade in={true} timeout={1000}>
            <Box
              component="img"
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Fade>

          {/* Navigation Buttons */}
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
              zIndex: 2,
            }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
              zIndex: 2,
            }}
          >
            <ChevronRight />
          </IconButton>

          {/* Dots Indicator */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1,
              zIndex: 2,
            }}
          >
            {images.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: index === currentIndex ? 'primary.main' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                  '&:hover': {
                    bgcolor: index === currentIndex ? 'primary.main' : 'rgba(255, 255, 255, 0.8)',
                  },
                }}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </Box>
        </Grid>

        {/* Right side - Countdown Timer */}
        <Grid 
          item 
          xs={12} 
          md={5} 
          sx={{ 
            height: { xs: 'auto', md: '100%' },
            minHeight: { xs: '200px', md: '100%' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("/images/pattern.png")',
              opacity: 0.1,
              animation: 'moveBackground 20s linear infinite',
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', px: 4, py: { xs: 3, md: 0 } }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"}
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Event Starts In
            </Typography>
            {eventDate && <CountdownTimer targetDate={eventDate} />}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
} 