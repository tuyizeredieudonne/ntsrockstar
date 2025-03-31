import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

const Footer: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: alpha(theme.palette.primary.main, 0.95),
        color: 'white',
        py: 6,
        mt: 'auto',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* About Section */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              About NTS Rockstar Party
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
              Join us for an unforgettable night of music and entertainment at Nyanza TSS. Experience the best local and international artists in one amazing event.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton color="inherit" sx={{ '&:hover': { color: '#1877F2' } }}>
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" sx={{ '&:hover': { color: '#1DA1F2' } }}>
                <TwitterIcon />
              </IconButton>
              <IconButton color="inherit" sx={{ '&:hover': { color: '#E4405F' } }}>
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit" sx={{ '&:hover': { color: '#FF0000' } }}>
                <YouTubeIcon />
              </IconButton>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Quick Links
            </Typography>
            <Stack spacing={1}>
              <Link href="/" color="inherit" sx={{ '&:hover': { opacity: 0.8 } }}>
                Home
              </Link>
              <Link href="/booking" color="inherit" sx={{ '&:hover': { opacity: 0.8 } }}>
                Book Tickets
              </Link>
              <Link href="/gallery" color="inherit" sx={{ '&:hover': { opacity: 0.8 } }}>
                Gallery
              </Link>
              <Link href="/contact" color="inherit" sx={{ '&:hover': { opacity: 0.8 } }}>
                Contact Us
              </Link>
            </Stack>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Contact Info
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Nyanza TSS
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Email: leboydechris@gmail.com
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Phone: +250 79 1786 228
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Date: May 17, 2025
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box
          sx={{
            mt: 4,
            pt: 2,
            borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            &copy; {new Date().getFullYear()} NTS Rockstar Party. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 
