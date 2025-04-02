import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Box,
  useTheme,
  useMediaQuery,
  Stack,
  Avatar,
  Divider,
  alpha,
  Fade,
  Tooltip,
  Badge,
  useScrollTrigger,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import GroupIcon from '@mui/icons-material/Group';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import HomeIcon from '@mui/icons-material/Home';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const Header: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [adminAnchorEl, setAdminAnchorEl] = React.useState<null | HTMLElement>(null);
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAdminMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAdminAnchorEl(event.currentTarget);
  };

  const handleAdminClose = () => {
    setAdminAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    handleClose();
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
    handleClose();
  };

  const menuItems = [
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    { label: 'Book Ticket', path: '/booking', icon: <BookOnlineIcon /> },
    { label: 'Gallery', path: '/gallery', icon: <PhotoLibraryIcon /> },
    { label: 'Contact', path: '/contact', icon: <ContactMailIcon /> },
  ];

  const adminMenuItems = [
    { label: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
    { label: 'Manage Ticket Types', path: '/admin/ticket-types', icon: <ConfirmationNumberIcon /> },
    { label: 'Manage Artists', path: '/admin/artists', icon: <GroupIcon /> },
    { label: 'Manage Bookings', path: '/admin/bookings', icon: <BookOnlineIcon /> },
  ];

  return (
    <Fade in={!trigger}>
    <AppBar 
      position="fixed" 
      sx={{ 
        background: alpha(theme.palette.background.default, 0.8),
        backdropFilter: 'blur(20px)',
          boxShadow: trigger ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
          borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          transition: 'all 0.3s ease-in-out',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ minHeight: '70px' }}>
          {/* Logo and Brand */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer',
                mr: 4,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                }
            }}
            onClick={() => router.push('/')}
          >
            <Image
              src="/images/rocklogo.png"
              alt="NTS Rockstar Party Logo"
              width={40}
              height={40}
              style={{ marginRight: '10px' }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.5px',
              }}
            >
              NTS Rockstar Party
            </Typography>
          </Box>

          {isMobile ? (
            <>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenu}
                sx={{
                  color: 'white',
                  '&:hover': {
                      background: alpha(theme.palette.primary.main, 0.1),
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease-in-out',
                }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                  TransitionComponent={Fade}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                      minWidth: 250,
                      background: alpha(theme.palette.background.paper, 0.95),
                      backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                      borderRadius: 2,
                  }
                }}
              >
                {menuItems.map((item) => (
                  <MenuItem 
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.1),
                        transform: 'translateX(5px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </MenuItem>
                ))}
                {session?.user?.role === 'admin' && [
                  <Divider key="admin-divider" sx={{ my: 1, borderColor: alpha(theme.palette.common.white, 0.1) }} />,
                  <Typography
                    key="admin-title"
                    variant="caption"
                    sx={{
                      px: 2,
                      py: 1,
                      color: 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <AdminPanelSettingsIcon fontSize="small" />
                    Admin Panel
                  </Typography>,
                  ...adminMenuItems.map((item) => (
                    <MenuItem 
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      sx={{
                        py: 1.5,
                        px: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        '&:hover': {
                          background: alpha(theme.palette.primary.main, 0.1),
                          transform: 'translateX(5px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </MenuItem>
                  ))
                ]}
                <Divider sx={{ my: 1, borderColor: alpha(theme.palette.common.white, 0.1) }} />
                {session ? (
                  <MenuItem 
                    onClick={handleSignOut}
                    sx={{
                      py: 1.5,
                      px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      color: 'error.main',
                      '&:hover': {
                          background: alpha(theme.palette.error.main, 0.1),
                          transform: 'translateX(5px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <LogoutIcon />
                    logOut
                  </MenuItem>
                ) : (
                  <>
                    <MenuItem 
                      onClick={() => handleNavigation('/auth/signin')}
                      sx={{
                        py: 1.5,
                        px: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                        '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.1),
                            transform: 'translateX(5px)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <LoginIcon />
                      login
                    </MenuItem>
                    <MenuItem 
                      onClick={() => handleNavigation('/auth/signup')}
                      sx={{
                        py: 1.5,
                        px: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                        '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.1),
                            transform: 'translateX(5px)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <PersonAddIcon />
                      register
                    </MenuItem>
                  </>
                )}
              </Menu>
            </>
          ) : (
            <>
              <Stack 
                direction="row" 
                spacing={2} 
                sx={{ flexGrow: 1 }}
              >
                {menuItems.map((item) => (
                    <Tooltip key={item.path} title={item.label} arrow>
                  <Button
                    color="inherit"
                    onClick={() => handleNavigation(item.path)}
                        startIcon={item.icon}
                    sx={{
                      '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.1),
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {item.label}
                  </Button>
                    </Tooltip>
                  ))}
                  {session?.user?.role === 'admin' && (
                    <>
                      <Button
                        color="inherit"
                        onClick={handleAdminMenu}
                        startIcon={<AdminPanelSettingsIcon />}
                        endIcon={<KeyboardArrowDownIcon />}
                        sx={{
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.1),
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.2s ease-in-out',
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 2,
                            background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                            transition: 'width 0.3s ease-in-out',
                          },
                          '&:hover::after': {
                            width: '100%',
                          },
                        }}
                      >
                        Admin Panel
                      </Button>
                      <Menu
                        anchorEl={adminAnchorEl}
                        open={Boolean(adminAnchorEl)}
                        onClose={handleAdminClose}
                        TransitionComponent={Fade}
                        PaperProps={{
                          sx: {
                            mt: 1.5,
                            minWidth: 250,
                            background: alpha(theme.palette.background.paper, 0.95),
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            borderRadius: 2,
                          }
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            px: 2,
                            py: 1,
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                          }}
                        >
                          <AdminPanelSettingsIcon fontSize="small" />
                          Admin Panel
                        </Typography>
                        {adminMenuItems.map((item) => (
                          <MenuItem 
                            key={item.path}
                            onClick={() => {
                              handleNavigation(item.path);
                              handleAdminClose();
                            }}
                            sx={{
                              py: 1.5,
                              px: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.1),
                                transform: 'translateX(5px)',
                              },
                              transition: 'all 0.2s ease-in-out',
                            }}
                          >
                            {item.icon}
                            {item.label}
                          </MenuItem>
                        ))}
                      </Menu>
                    </>
                  )}
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                {session ? (
                  <>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          p: 1,
                          borderRadius: 2,
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.1),
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                      <Avatar 
                        src={session.user?.image || undefined}
                        alt={session.user?.name || 'User'}
                        sx={{ 
                          width: 32, 
                          height: 32,
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                            border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        }}
                      />
                        <Typography variant="body2" sx={{ color: 'text.primary' }}>
                          {session.user?.name}
                      </Typography>
                    </Box>
                      <Tooltip title="Sign Out" arrow>
                        <IconButton
                      onClick={handleSignOut}
                      sx={{
                        color: 'error.main',
                        '&:hover': {
                              background: alpha(theme.palette.error.main, 0.1),
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <LogoutIcon />
                        </IconButton>
                      </Tooltip>
                  </>
                ) : (
                  <>
                    <Button
                      color="inherit"
                        onClick={() => handleNavigation('/auth/signin')}
                        startIcon={<LoginIcon />}
                      sx={{
                        '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.1),
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="contained"
                        onClick={() => handleNavigation('/auth/signup')}
                        startIcon={<PersonAddIcon />}
                      sx={{
                        background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 20px rgba(255, 107, 107, 0.3)',
                          },
                          transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </Stack>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
    </Fade>
  );
};

export default Header; 
