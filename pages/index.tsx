import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  Divider,
  Paper,
  Stack,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
  Slide,
  Chip,
  Avatar,
  Rating,
} from '@mui/material';
import { format } from 'date-fns';
import Countdown from 'react-countdown';
import Head from 'next/head';
import Link from 'next/link';
import ReactPlayer from 'react-player/lazy';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import {
  PlayArrow,
  Pause,
  Share,
  Favorite,
  FavoriteBorder,
  Star,
  AccessTime,
  LocationOn,
  Group,
  MusicNote,
  EmojiEvents,
  TrendingUp,
  CheckCircle,
} from '@mui/icons-material';
import CountdownTimer from '../components/CountdownTimer';
import ImageSlider from '../components/ImageSlider';
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

// Type for HomeUpdate
interface HomeUpdateType {
  _id: string;
  title: string;
  content: string;
  type: 'announcement' | 'news' | 'image' | 'video';
  imageUrl?: string;
  videoUrl?: string;
  isPublished: boolean;
  createdAt: string;
}

// Type for Artist
interface ArtistType {
  _id: string;
  name: string;
  description: string;
  image: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  featured?: boolean;
}

// Add type for countdown renderer props
interface CountdownRendererProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
}

// Fix for search input field or any input with placeholder styling
const searchStyles = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '50px',
  padding: '10px 20px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: 'white',
  '& input::placeholder': {
    color: 'rgba(255, 255, 255, 0.5)',
  }
};

export default function Home() {
  const [eventDetails, setEventDetails] = useState<EventDetailsType | null>(null);
  const [artists, setArtists] = useState<ArtistType[]>([]);
  const router = useRouter();
  const { data: session } = useSession();
  const theme = useTheme();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const [homeUpdates, setHomeUpdates] = useState<HomeUpdateType[]>([]);

  // Fetch event details and featured artists
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch event details
        const eventResponse = await fetch('/api/event-details');
        const eventData = await eventResponse.json();
        
        if (eventData.success) {
          setEventDetails(eventData.data);
        }
        
        // Fetch artists
        const artistsResponse = await fetch('/api/artists');
        const artistsData = await artistsResponse.json();
        
        if (artistsData.success) {
          setArtists(artistsData.data);
        }

        // Fetch home updates with error handling
        try {
          const homeUpdatesResponse = await fetch('/api/home-updates');
          const homeUpdatesData = await homeUpdatesResponse.json();
          if (homeUpdatesData.success) {
            setHomeUpdates(homeUpdatesData.data);
          }
        } catch (homeUpdatesError) {
          console.error('Error fetching home updates:', homeUpdatesError);
          // Set empty array to prevent undefined errors
          setHomeUpdates([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  // Update countdown renderer with proper types
  const countdownRenderer = ({ days, hours, minutes, seconds, completed }: CountdownRendererProps) => {
    if (completed) {
      return <Typography variant="h6">Discount period has ended!</Typography>;
    } else {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4">{days}</Typography>
            <Typography variant="body2">Days</Typography>
          </Box>
          <Typography variant="h4">:</Typography>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4">{hours}</Typography>
            <Typography variant="body2">Hours</Typography>
          </Box>
          <Typography variant="h4">:</Typography>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4">{minutes}</Typography>
            <Typography variant="body2">Minutes</Typography>
          </Box>
          <Typography variant="h4">:</Typography>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4">{seconds}</Typography>
            <Typography variant="body2">Seconds</Typography>
          </Box>
        </Box>
      );
    }
  };

  return (
    <>
      <Head>
        <title>NTS Rockstar Party</title>
        <meta name="description" content="Join us for an unforgettable night of music and entertainment at Nyanza TSS" />
      </Head>

      <Header />

      <Box 
        component="main" 
        sx={{ 
          pt: 8,
          background: 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)',
          minHeight: '100vh',
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
        {/* Hero Section with Image Slider */}
        <Box sx={{ position: 'relative' }}>
          <ImageSlider eventDate={new Date('2025-05-17T18:00:00')} />
        </Box>

        {/* Hero Text Section */}
        <Container>
          <Box
            sx={{
              textAlign: 'center',
              color: 'text.primary',
              width: '100%',
              maxWidth: '800px',
              mx: 'auto',
              px: 2,
              py: 6,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              NTS Rockstar Party
            </Typography>
            <Typography 
              variant="h5" 
              sx={{
                mb: 4,
                color: 'text.secondary',
                textShadow: '0 1px 5px rgba(0,0,0,0.3)',
              }}
            >
              The Ultimate Music Experience
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
            >
              <Button 
                variant="contained" 
                size="large"
                component={Link} 
                href="/booking"
                sx={{
                  background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
                    boxShadow: '0 4px 20px rgba(255, 107, 107, 0.3)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                Book Ticket Now
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                component={Link} 
                href="/gallery"
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: 'primary.main',
                    background: alpha(theme.palette.primary.main, 0.1),
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                View Gallery
              </Button>
            </Stack>
          </Box>
        </Container>

        {/* Countdown Timer Section */}
        <Box 
          sx={{ 
            py: 8, 
            background: alpha(theme.palette.primary.main, 0.05),
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at center, rgba(255, 107, 107, 0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            }
          }}
        >
          <Container>
            <Typography 
              variant="h3" 
              component="h2" 
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
              Event Countdown
            </Typography>
            <CountdownTimer targetDate={new Date('2025-05-17T18:00:00')} />
          </Container>
        </Box>

        {/* Event Highlights Section */}
        <Box sx={{ py: 8, background: alpha(theme.palette.primary.main, 0.05) }}>
          <Container>
            <Typography 
              variant="h3" 
              component="h2" 
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
              Event Highlights
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Zoom in timeout={1000}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      height: '100%',
                      transition: 'all 0.3s ease-in-out',
                      background: alpha(theme.palette.background.paper, 0.5),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        background: alpha(theme.palette.background.paper, 0.8),
                        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                      },
                    }}
                  >
                    <MusicNote sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>Live Music</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Experience the best live performances from top artists
                    </Typography>
                  </Paper>
                </Zoom>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Zoom in timeout={1000} style={{ transitionDelay: '200ms' }}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      height: '100%',
                      transition: 'all 0.3s ease-in-out',
                      background: alpha(theme.palette.background.paper, 0.5),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        background: alpha(theme.palette.background.paper, 0.8),
                        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                      },
                    }}
                  >
                    <EmojiEvents sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>Special Prizes</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Win exciting prizes and exclusive merchandise
                    </Typography>
                  </Paper>
                </Zoom>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Zoom in timeout={1000} style={{ transitionDelay: '400ms' }}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      height: '100%',
                      transition: 'all 0.3s ease-in-out',
                      background: alpha(theme.palette.background.paper, 0.5),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        background: alpha(theme.palette.background.paper, 0.8),
                        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                      },
                    }}
                  >
                    <Group sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>Meet & Greet</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get up close with your favorite artists
                    </Typography>
                  </Paper>
                </Zoom>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Zoom in timeout={1000} style={{ transitionDelay: '600ms' }}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      height: '100%',
                      transition: 'all 0.3s ease-in-out',
                      background: alpha(theme.palette.background.paper, 0.5),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        background: alpha(theme.palette.background.paper, 0.8),
                        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                      },
                    }}
                  >
                    <TrendingUp sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>Trending Artists</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Discover the hottest new talents
                    </Typography>
                  </Paper>
                </Zoom>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Event Details Section */}
        <Container sx={{ py: 8 }}>
          <Slide in timeout={1000}>
            <Typography 
              variant="h3" 
              component="h2" 
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
              Event Details
            </Typography>
          </Slide>
          
          {eventDetails ? (
            <Grid container spacing={4} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Zoom in timeout={1000}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 4, 
                      height: '100%',
                      background: alpha(theme.palette.background.paper, 0.5),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        background: alpha(theme.palette.background.paper, 0.8),
                        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                      }
                    }}
                  >
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      When & Where
                    </Typography>
                    <Box sx={{ my: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccessTime sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="body1">
                      17/5/2025  at 18:00pm to 22:00pm
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="body1">
                          {eventDetails.location || 'Nyanza TSS'}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h5" gutterBottom sx={{ mt: 3, fontWeight: 600 }}>
                      Ticket Information
                    </Typography>
                    <Box sx={{ my: 2 }}>
                      <Grid container spacing={3}>
                        {eventDetails.ticketTypes.map((ticket, index) => {
                          const isDiscounted = new Date() < new Date(ticket.discountEndTime);
                          const currentPrice = isDiscounted ? ticket.discountPrice : ticket.price;
                          
                          return (
                            <Grid item xs={12} sm={6} key={index}>
                              <Paper
                                elevation={2}
                                sx={{
                                  p: 3,
                                  height: '100%',
                                  background: alpha(theme.palette.background.paper, 0.5),
                                  backdropFilter: 'blur(10px)',
                                  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                                  transition: 'all 0.3s ease-in-out',
                                  '&:hover': {
                                    transform: 'translateY(-5px)',
                                    background: alpha(theme.palette.background.paper, 0.8),
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                                  }
                                }}
                              >
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                  {ticket.name}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" paragraph>
                                  {ticket.description}
                                </Typography>
                                
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
                                    {currentPrice} RWF
                                  </Typography>
                                  {isDiscounted && (
                                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                      Early Bird Price! Save {ticket.price - ticket.discountPrice} RWF
                                    </Typography>
                                  )}
                                </Box>

                                <Stack spacing={1}>
                                  {ticket.features.map((feature, idx) => (
                                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
                                      <CheckCircle sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
                                      <Typography variant="body2">{feature}</Typography>
                                    </Box>
                                  ))}
                                </Stack>

                                {isDiscounted && (
                                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', color: 'error.main' }}>
                                    <AccessTime sx={{ fontSize: 16, mr: 1 }} />
                                    <Typography variant="body2">
                                      Early bird discount ends {format(new Date(ticket.discountEndTime), 'MMM d, yyyy')}
                                    </Typography>
                                  </Box>
                                )}
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  </Paper>
                </Zoom>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Zoom in timeout={1000} style={{ transitionDelay: '200ms' }}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 4, 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      background: alpha(theme.palette.background.paper, 0.5),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        background: alpha(theme.palette.background.paper, 0.8),
                        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                      }
                    }}
                  >
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      Payment Information
                    </Typography>
                    <Box sx={{ my: 2 }}>
                      <Typography variant="body1" gutterBottom>
                        <strong>MoMo phone number:</strong>0791786228
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {eventDetails.momoInstructions || 'Pay using MTN Mobile Money to the number above and keep your transaction ID and payment screen shot for verification.'}
                      </Typography>
                    </Box>
                    
                    {eventDetails.ticketTypes[0].discountEndTime && new Date(eventDetails.ticketTypes[0].discountEndTime) > new Date() && (
                      <Box sx={{ mt: 'auto', pt: 2 }}>
                        <Divider sx={{ mb: 2, borderColor: alpha(theme.palette.common.white, 0.1) }} />
                        <Typography variant="h6" align="center" gutterBottom color="secondary" sx={{ fontWeight: 600 }}>
                          Early Bird Discount Available!
                        </Typography>
                        <Typography variant="body2" align="center" color="text.secondary">
                          Book now to save {eventDetails.ticketTypes[0].price - eventDetails.ticketTypes[0].discountPrice} RWF!
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Zoom>
              </Grid>
            </Grid>
          ) : (
            <Typography align="center">Loading event details...</Typography>
          )}
        </Container>

        {/* Featured Artists Section */}
        <Box sx={{ py: 8, background: alpha(theme.palette.background.paper, 0.3) }}>
          <Container>
            <Slide in timeout={1000} direction="up">
              <Typography 
                variant="h3" 
                component="h2" 
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
                Featured Artists
              </Typography>
            </Slide>
            
            {artists.length > 0 ? (
              <Grid container spacing={4} sx={{ mt: 2 }}>
                {artists.map((artist, index) => (
                  <Grid item key={artist._id} xs={12} sm={6} md={4}>
                    <Zoom in timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
                      <Card 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          transition: 'all 0.3s ease-in-out',
                          background: alpha(theme.palette.background.paper, 0.5),
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                          '&:hover': {
                            transform: 'translateY(-10px)',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                            background: alpha(theme.palette.background.paper, 0.8),
                          },
                          borderRadius: 2,
                          overflow: 'hidden'
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="240"
                          image={artist.image || '/artist-placeholder.jpg'}
                          alt={artist.name}
                          sx={{
                            transition: 'transform 0.3s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                            {artist.name}
                          </Typography>
                          <Typography>
                            {artist.description}
                          </Typography>
                          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating value={4.5} precision={0.5} readOnly />
                            <Typography variant="body2" color="text.secondary">
                              (4.5/5)
                            </Typography>
                          </Box>
                        </CardContent>
                        {artist.socialLinks.instagram && (
                          <CardActions>
                            <Button 
                              size="small" 
                              color="primary"
                              onClick={() => window.open(artist.socialLinks.instagram, '_blank')}
                              sx={{
                                background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                                color: 'white',
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
                                }
                              }}
                            >
                              Instagram
                            </Button>
                          </CardActions>
                        )}
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography align="center">No artists available yet.</Typography>
            )}
          </Container>
        </Box>

        {/* Testimonials Section */}
        <Box sx={{ py: 8 }}>
          <Container>
            <Typography 
              variant="h3" 
              component="h2" 
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
              What Our Fans Say
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  name: 'JD',
                  avatar: '/images/avatars/avatar1.jpg',
                  rating: 5,
                  comment: 'The best music event I\'ve ever attended! The energy was incredible.',
                },
                {
                  name: 'Dieme',
                  avatar: '/images/avatars/avatar2.jpg',
                  rating: 5,
                  comment: 'Amazing performances and great organization. Can\'t wait for the next one!',
                },
                {
                  name: 'Saha mara',
                  avatar: '/images/avatars/avatar3.jpg',
                  rating: 5,
                  comment: 'The atmosphere was electric! The artists were phenomenal.',
                },
              ].map((testimonial, index) => (
                <Grid item key={index} xs={12} md={4}>
                  <Zoom in timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        background: alpha(theme.palette.background.paper, 0.5),
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          background: alpha(theme.palette.background.paper, 0.8),
                        },
                      }}
                    >
                      <Avatar
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        sx={{ width: 80, height: 80, mb: 2 }}
                      />
                      <Typography variant="h6" gutterBottom>
                        {testimonial.name}
                      </Typography>
                      <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        "{testimonial.comment}"
                      </Typography>
                    </Paper>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Newsletter Section */}
        <Box sx={{ 
          py: 8, 
          background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
          }
        }}>
          <Container sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                  Stay Updated
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Subscribe to our newsletter to get the latest updates about the event, exclusive offers, and more!
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper 
                  component="form" 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    gap: 2,
                    background: alpha(theme.palette.common.white, 0.1),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                  }}
                >
                  <input
                    type="email"
                    placeholder="Enter your email"
                    style={searchStyles}
                  />
                  <Button 
                    variant="contained"
                    sx={{ 
                      background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
                        boxShadow: '0 4px 20px rgba(255, 107, 107, 0.3)',
                      }
                    }}
                  >
                    Subscribe
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* News and Updates Section */}
        {homeUpdates.length > 0 && (
          <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 800,
                mb: 4,
                textAlign: 'center',
                background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Latest News & Updates
            </Typography>
            
            <Grid container spacing={4}>
              {homeUpdates.map((update: HomeUpdateType) => (
                <Grid item xs={12} md={update.type === 'announcement' ? 12 : 6} key={update._id}>
                  <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                    <Paper
                      sx={{
                        p: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: alpha(theme.palette.background.paper, 0.5),
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                          background: alpha(theme.palette.background.paper, 0.8),
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={update.type.charAt(0).toUpperCase() + update.type.slice(1)} 
                            color={
                              update.type === 'announcement' ? 'error' :
                              update.type === 'news' ? 'primary' :
                              update.type === 'image' ? 'success' : 'secondary'
                            }
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                            {update.title}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(update.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" sx={{ mb: 3, flexGrow: 1 }}>
                        {update.content}
                      </Typography>
                      
                      {update.type === 'image' && update.imageUrl && (
                        <Box sx={{ 
                          mt: 'auto', 
                          mb: 2, 
                          textAlign: 'center',
                          position: 'relative',
                          paddingTop: '56.25%', // 16:9 aspect ratio
                          overflow: 'hidden',
                          borderRadius: 1,
                          border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                        }}>
                          <img 
                            src={update.imageUrl} 
                            alt={update.title} 
                            style={{ 
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }} 
                          />
                        </Box>
                      )}
                      
                      {update.type === 'video' && update.videoUrl && (
                        <Box sx={{ 
                          mt: 'auto', 
                          mb: 2, 
                          textAlign: 'center',
                          position: 'relative',
                          paddingTop: '56.25%', // 16:9 aspect ratio
                          borderRadius: 1,
                          border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                          overflow: 'hidden',
                        }}>
                          <iframe
                            style={{ 
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                            }}
                            src={update.videoUrl}
                            title={update.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </Box>
                      )}
                    </Paper>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Container>
        )}
      </Box>

      <Footer />
    </>
  );
} 
