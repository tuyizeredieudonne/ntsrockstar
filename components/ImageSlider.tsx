import React, { useState, useEffect } from 'react';
import { Box, Paper, IconButton, Typography, Grid, useTheme, useMediaQuery, alpha } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import CountdownTimer from './CountdownTimer';
import Image from 'next/image';

interface Image {
  src: string;
  alt: string;
}

interface ImageSliderProps {
  images?: Image[];
  eventDate?: Date;
}

const defaultImages: Image[] = [
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

const ImageSlider: React.FC<ImageSliderProps> = ({ images = defaultImages, eventDate }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (!images || images.length === 0) return;

    const timer = setInterval(() => {
      if (!isTransitioning) {
        handleNext();
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [images, isTransitioning]);

  const handleTransition = (index: number) => {
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handlePrevious = () => {
    if (!images || images.length === 0 || isTransitioning) return;
    handleTransition((currentIndex - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    if (!images || images.length === 0 || isTransitioning) return;
    handleTransition((currentIndex + 1) % images.length);
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
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            {images.map((image, index) => (
              <Box
                key={index}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: index === currentIndex ? 1 : 0,
                  transform: `translateX(${index === currentIndex ? '0' : index < currentIndex ? '-100%' : '100%'})`,
                  transition: 'all 0.5s ease-in-out',
                }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  style={{
                    objectFit: 'cover',
                  }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index === 0}
                />
              </Box>
            ))}
          </Box>

          {/* Navigation Buttons */}
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: alpha(theme.palette.common.white, 0.8),
              '&:hover': {
                bgcolor: alpha(theme.palette.common.white, 0.9),
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
              bgcolor: alpha(theme.palette.common.white, 0.8),
              '&:hover': {
                bgcolor: alpha(theme.palette.common.white, 0.9),
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
                onClick={() => handleTransition(index)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: index === currentIndex ? 'primary.main' : alpha(theme.palette.common.white, 0.5),
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    bgcolor: index === currentIndex ? 'primary.main' : alpha(theme.palette.common.white, 0.8),
                  },
                }}
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
};

export default ImageSlider; 