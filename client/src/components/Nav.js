import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/appSlice';
import { useGetCartCountQuery } from '../redux/apiSlice';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import StoreIcon from '@mui/icons-material/Store';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Nav = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const userFromStore = useSelector((state) => state.app.user);

  // Parse User Data
  const { userId, isAdmin, fullName, isAuthenticated } = useMemo(() => {
    const userData = userFromStore?.data;
    if (!userData) {
      return { userId: null, isAdmin: false, fullName: "", isAuthenticated: false };
    }
    return {
      userId: userData._id,
      isAdmin: userData.role === "Admin",
      fullName: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
      isAuthenticated: true,
    };
  }, [userFromStore]);

  // RTK Query hook for cart count (auto-refreshes when tags are invalidated)
  const { data: totalAddedItems = 0 } = useGetCartCountQuery(userId, {
    skip: !userId || isAdmin,
  });

  // State
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Handlers
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    handleCloseUserMenu();
    dispatch(logout());
    navigate("/login");
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false); // Close drawer on mobile nav
  };

  // Links Configuration
  const userLinks = [
    { label: "Products", path: "/product", icon: <StoreIcon /> },
    { label: "Contact Us", path: "/contactUs", icon: <ContactMailIcon /> },
  ];

  const adminLinks = [
    { label: "User Management", path: "/user-management", icon: <PeopleIcon /> },
    { label: "Product Management", path: "/product-management", icon: <InventoryIcon /> },
  ];

  const guestLinks = [
    { label: "Login", path: "/login", icon: <LoginIcon /> },
    { label: "Signup", path: "/signup", icon: <PersonAddIcon /> },
  ];

  const currentLinks = isAdmin ? adminLinks : isAuthenticated ? userLinks : guestLinks;

  // Render Mobile Drawer
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box sx={{ py: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '0.5px' }}>
          Shopveda
        </Typography>
      </Box>
      <Divider />
      <List>
        {currentLinks.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={() => handleNavigate(item.path)} selected={location.pathname === item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        {/* Mobile Cart & Logout (if authenticated) */}
        {isAuthenticated && !isAdmin && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigate('/cart')}>
              <ListItemIcon>
                <Badge badgeContent={totalAddedItems} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="Cart" />
            </ListItemButton>
          </ListItem>
        )}
        {isAuthenticated && (
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'primary.main', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* LOGO - Desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, alignItems: 'center' }}>
            <Box
              onClick={() => navigate(isAdmin ? '/user-management' : '/product')}
              sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Typography
                variant="h5"
                noWrap
                sx={{
                  mr: 2,
                  display: { xs: 'none', md: 'flex' },
                  fontWeight: 800,
                  letterSpacing: '0.5px',
                  color: 'inherit',
                  textDecoration: 'none',
                  fontStyle: 'italic'
                }}
              >
                Shopveda
              </Typography>
            </Box>
          </Box>


          {/* LOGO & MENU - Mobile */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1, alignItems: 'center' }}>
            <Typography
              variant="h6"
              noWrap
              component="a"
              onClick={() => navigate('/product')}
              sx={{
                flexGrow: 1,
                display: { xs: 'flex', md: 'none' },
                fontWeight: 800,
                letterSpacing: '0.5px',
                color: 'inherit',
                textDecoration: 'none',
                cursor: 'pointer',
                fontStyle: 'italic'
              }}
            >
              Shopveda
            </Typography>
          </Box>

          {/* LINKS - Desktop */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 2 }}>
            {currentLinks.map((page) => (
              <Button
                key={page.label}
                onClick={() => handleNavigate(page.path)}
                startIcon={page.icon}
                sx={{
                  my: 2,
                  color: 'white',
                  display: 'flex',
                  fontWeight: location.pathname === page.path ? 'bold' : 'normal',
                  borderBottom: location.pathname === page.path ? '2px solid white' : '2px solid transparent',
                  '&:hover': { color: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                {page.label}
              </Button>
            ))}
          </Box>

          {/* USER SETTINGS (Desktop & Cart) */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Cart Icon (Desktop Only) */}
            {isAuthenticated && !isAdmin && (
              <IconButton
                onClick={() => handleNavigate('/cart')}
                sx={{ p: 0, mr: 2, display: { xs: 'none', md: 'flex' } }}
              >
                <Badge badgeContent={totalAddedItems} color="error">
                  <ShoppingCartIcon sx={{ color: 'white' }} />
                </Badge>
              </IconButton>
            )}

            {/* Profile Menu */}
            {isAuthenticated ? (
              <>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
                    {fullName ? fullName.charAt(0).toUpperCase() : <AccountCircleIcon />}
                  </Avatar>
                </IconButton>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  keepMounted
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem disabled>
                    <Typography textAlign="center" variant="body2" fontWeight="bold">Hello, {fullName}</Typography>
                  </MenuItem>
                  <Divider />
                  {isAdmin && (
                    <MenuItem onClick={() => { handleNavigate('/user-management'); handleCloseUserMenu(); }}>
                      <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
                      <Typography textAlign="center">Users</Typography>
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                    <Typography textAlign="center" color="error">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/signup')}
                  sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                >
                  Signup
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>


      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Nav;

