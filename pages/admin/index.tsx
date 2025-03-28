import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  CardHeader,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  People as PeopleIcon,
  ConfirmationNumber as TicketIcon,
  Group as ArtistIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Link from 'next/link';
import axios from 'axios';

interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalArtists: number;
  totalRevenue: number;
}

interface HomeUpdate {
  _id: string;
  title: string;
  content: string;
  type: 'announcement' | 'news' | 'image' | 'video';
  imageUrl?: string;
  videoUrl?: string;
  isPublished: boolean;
  createdAt: string;
}

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [homeUpdates, setHomeUpdates] = useState<HomeUpdate[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [statsRes, homeUpdatesRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/home-updates')
        ]);
        
        const statsData = await statsRes.json();
        const homeUpdatesData = await homeUpdatesRes.json();
        
        if (statsData.success) {
          setStats(statsData.data);
        } else {
          setError('Failed to load dashboard statistics');
        }

        if (homeUpdatesData.success) {
          setHomeUpdates(homeUpdatesData.data);
        }
      } catch (err) {
        setError('An error occurred while loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status, router]);

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
            pt: 8,
          }}
        >
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ pt: 8 }}>
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        </Container>
      </>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#FF6B6B',
      path: '/admin/users',
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: <TicketIcon sx={{ fontSize: 40 }} />,
      color: '#4ECDC4',
      path: '/admin/bookings',
    },
    {
      title: 'Total Artists',
      value: stats?.totalArtists || 0,
      icon: <ArtistIcon sx={{ fontSize: 40 }} />,
      color: '#45B7D1',
      path: '/admin/artists',
    },
    {
      title: 'Total Revenue',
      value: `RWF ${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#96CEB4',
      path: '/admin/revenue',
    },
  ];

  return (
    <>
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
            Admin Dashboard
          </Typography>

          <Grid container spacing={3}>
            {statCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: alpha(theme.palette.background.paper, 0.5),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: `0 8px 30px ${alpha(card.color, 0.2)}`,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{ color: card.color }}
                      >
                        {card.title}
                      </Typography>
                      <Box sx={{ color: card.color }}>{card.icon}</Box>
                    </Box>
                    <Typography
                      variant="h4"
                      component="div"
                      sx={{ fontWeight: 700, color: 'text.primary' }}
                    >
                      {card.value}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => router.push(card.path)}
                      sx={{
                        color: card.color,
                        '&:hover': {
                          background: alpha(card.color, 0.1),
                        },
                      }}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Paper
            sx={{
              mt: 4,
              p: 3,
              background: alpha(theme.palette.background.paper, 0.5),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => router.push('/admin/ticket-types')}
                  sx={{
                    background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
                    },
                  }}
                >
                  Manage Ticket Types
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => router.push('/admin/artists')}
                  sx={{
                    background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
                    },
                  }}
                >
                  Manage Artists
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => router.push('/admin/bookings')}
                  sx={{
                    background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
                    },
                  }}
                >
                  View Bookings
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => router.push('/admin/users')}
                  sx={{
                    background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
                    },
                  }}
                >
                  Manage Users
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default AdminDashboard; 