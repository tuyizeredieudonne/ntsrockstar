import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Stack,
  useTheme,
  alpha,
  Dialog,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
  description: string;
}

const galleryImages: GalleryImage[] = [
  {
    id: '1',
    url: '/images/event1.jpeg',
    title: 'Live Performance',
    category: 'concert',
    description: 'Amazing live performance at NTS Rockstar Party 2024',
  },
  {
    id: '2',
    url: '/images/event2.jpeg',
    title: 'Crowd Energy',
    category: 'concert',
    description: 'The crowd enjoying the music',
  },
  {
    id: '3',
    url: '/images/rock1.png',
    title: 'Featured Artist',
    category: 'artists',
    description: 'One of our amazing featured artists',
  },
  {
    id: '4',
    url: '/images/rock3.png',
    title: 'Venue Setup',
    category: 'venue',
    description: 'Beautiful venue setup for the event',
  },
  {
    id: '5',
    url: '/images/event2.jpeg',
    title: 'Stage Performance',
    category: 'concert',
    description: 'Stunning stage performance',
  },
  {
    id: '6',
    url: '/images/rock2.png',
    title: 'Artist Spotlight',
    category: 'artists',
    description: 'Artist performing on stage',
  },
  {
    id: '7',
    url: '/images/rocklogo.png',
    title: 'Venue Atmosphere',
    category: 'venue',
    description: 'The amazing atmosphere of our venue',
  },
  {
    id: '8',
    url: '/images/event1.jpeg',
    title: 'Crowd Interaction',
    category: 'concert',
    description: 'Fans interacting with artists',
  },
];

const categories = ['all', 'concert', 'artists', 'venue'];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const filteredImages = selectedCategory === 'all'
    ? galleryImages
    : galleryImages.filter(image => image.category === selectedCategory);

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    setCurrentIndex(galleryImages.findIndex(img => img.id === image.id));
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
    setSelectedImage(filteredImages[(currentIndex + 1) % filteredImages.length]);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
    setSelectedImage(filteredImages[(currentIndex - 1 + filteredImages.length) % filteredImages.length]);
  };

  const handlePrevImage = () => {
    handlePrevious();
  };

  const handleNextImage = () => {
    handleNext();
  };

  return (
    <>
      <Head>
        <title>Gallery - NTS Rockstar Party</title>
        <meta name="description" content="View photos from past NTS Rockstar Party events" />
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
            Event Gallery
          </Typography>

          {/* Category Filter */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                onClick={() => setSelectedCategory(category)}
                color={selectedCategory === category ? 'primary' : 'default'}
                sx={{
                  backgroundColor: selectedCategory === category 
                    ? alpha(theme.palette.primary.main, 0.2)
                    : alpha(theme.palette.common.white, 0.05),
                  color: selectedCategory === category 
                    ? 'primary.main'
                    : 'text.secondary',
                  '&:hover': {
                    backgroundColor: selectedCategory === category
                      ? alpha(theme.palette.primary.main, 0.3)
                      : alpha(theme.palette.common.white, 0.08),
                  },
                }}
              />
            ))}
          </Box>

          {/* Image Grid */}
          <Grid container spacing={3}>
            {filteredImages.map((image) => (
              <Grid item key={image.id} xs={12} sm={6} md={4} lg={3}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    background: alpha(theme.palette.background.paper, 0.5),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                      background: alpha(theme.palette.background.paper, 0.8),
                    },
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                  onClick={() => handleImageClick(image)}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '75%',
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      src={image.url}
                      alt={image.title}
                      fill
                      style={{
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease-in-out',
                      }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {image.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {image.description}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Lightbox */}
      <Dialog
        open={!!selectedImage}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: 'white',
              bgcolor: alpha(theme.palette.common.black, 0.5),
              '&:hover': {
                bgcolor: alpha(theme.palette.common.black, 0.7),
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                src={selectedImage.url}
                alt={selectedImage.title}
                fill
                style={{
                  objectFit: 'contain',
                }}
                sizes="100vw"
                priority
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 3,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  color: 'white',
                }}
              >
                <Typography variant="h6">{selectedImage.title}</Typography>
                <Typography variant="body2">{selectedImage.description}</Typography>
              </Box>
            </Box>
          )}
          <IconButton
            onClick={handlePrevImage}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              bgcolor: alpha(theme.palette.common.black, 0.5),
              '&:hover': {
                bgcolor: alpha(theme.palette.common.black, 0.7),
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            onClick={handleNextImage}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              bgcolor: alpha(theme.palette.common.black, 0.5),
              '&:hover': {
                bgcolor: alpha(theme.palette.common.black, 0.7),
              },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Dialog>

      <Footer />
    </>
  );
} 