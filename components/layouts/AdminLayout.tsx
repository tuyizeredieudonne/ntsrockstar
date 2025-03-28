import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HomeIcon from '@mui/icons-material/Home';

// Admin navigation items
const adminNavItems = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/admin' 
  },
  { 
    text: 'Users', 
    icon: <PeopleIcon />, 
    path: '/admin/users' 
  },
  { 
    text: 'Events', 
    icon: <EventIcon />, 
    path: '/admin/events' 
  },
  { 
    text: 'Categories', 
    icon: <CategoryIcon />, 
    path: '/admin/categories' 
  },
  { 
    text: 'Home Updates', 
    icon: <HomeIcon />, 
    path: '/admin/home-updates' 
  },
  { 
    text: 'Notifications', 
    icon: <NotificationsIcon />, 
    path: '/admin/notifications' 
  },
  { 
    text: 'Settings', 
    icon: <SettingsIcon />, 
    path: '/admin/settings' 
  },
]; 