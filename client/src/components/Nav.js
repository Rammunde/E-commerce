import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { logout } from '../redux/appSlice';
import { useGetCartCountQuery } from '../redux/apiSlice';
import { PORTAL_NAME } from '../config';
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

    const navLinkStyle = {
        color: "white",
        textDecoration: "none",
        marginRight: "20px",
        fontWeight: 500,
    };

    const activeLinkStyle = {
        borderBottom: "2px solid white",
    };

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
                    {PORTAL_NAME}
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
        <div
            style={{
                background: "#626467", // Navbar color
                paddingTop: "5px",
                paddingBottom: "10px",
                position: "sticky",
                top: 0,
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <img
                    alt="Logo"
                    className="logo"
                    src="https://img.etimg.com/thumb/msid-100973430,width-650,height-488,imgsize-2985114,resizemode-75/indian-ecommerce-market.jpg"
                    style={{ height: "50px", marginRight: "20px" }} // added margin for spacing
                />
                <div style={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
                    {isAuthenticated && (
                        <>
                            {!isAdmin && (
                                <>
                                    <NavLink
                                        to="/"
                                        style={({ isActive }) =>
                                            isActive
                                                ? { ...navLinkStyle, ...activeLinkStyle }
                                                : navLinkStyle
                                        }
                                    >
                                        Home
                                    </NavLink>
                                    <NavLink
                                        to="/product"
                                        style={({ isActive }) =>
                                            isActive
                                                ? { ...navLinkStyle, ...activeLinkStyle }
                                                : navLinkStyle
                                        }
                                    >
                                        Products
                                    </NavLink>
                                    <NavLink
                                        to="/contactUs"
                                        style={({ isActive }) =>
                                            isActive
                                                ? { ...navLinkStyle, ...activeLinkStyle }
                                                : navLinkStyle
                                        }
                                    >
                                        Contact Us
                                    </NavLink>
                                </>
                            )}
                            {isAdmin && (
                                <>
                                    <NavLink
                                        to="/user-management"
                                        style={({ isActive }) =>
                                            isActive
                                                ? { ...navLinkStyle, ...activeLinkStyle }
                                                : navLinkStyle
                                        }
                                    >
                                        User Management
                                    </NavLink>
                                    <NavLink
                                        to="/product-management"
                                        style={({ isActive }) =>
                                            isActive
                                                ? { ...navLinkStyle, ...activeLinkStyle }
                                                : navLinkStyle
                                        }
                                    >
                                        Product Management
                                    </NavLink>
                                </>
                            )}
                        </>
                    )}
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                    {!isAuthenticated ? (
                        <>
                            <NavLink
                                to="/signup"
                                style={({ isActive }) =>
                                    isActive
                                        ? { ...navLinkStyle, ...activeLinkStyle }
                                        : navLinkStyle
                                }
                            >
                                Signup
                            </NavLink>
                            <NavLink
                                to="/login"
                                style={({ isActive }) =>
                                    isActive
                                        ? { ...navLinkStyle, ...activeLinkStyle }
                                        : navLinkStyle
                                }
                            >
                                Login
                            </NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink onClick={handleLogout} to="/login" style={navLinkStyle}>
                                Logout ({fullName})
                            </NavLink>

                            {!isAdmin && (
                                <NavLink
                                    to="/cart"
                                    style={({ isActive }) =>
                                        isActive
                                            ? { ...navLinkStyle, ...activeLinkStyle }
                                            : navLinkStyle
                                    }
                                >
                                    <FontAwesomeIcon icon={faCartShopping} size="lg" />
                                    {totalAddedItems > 0 && (
                                        <span
                                            style={{
                                                position: "relative",
                                                top: "-10px",
                                                right: "-10px",
                                                background: "red",
                                                color: "white",
                                                borderRadius: "50%",
                                                padding: "0 6px",
                                                fontSize: "12px",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {totalAddedItems}
                                        </span>
                                    )}
                                </NavLink>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Nav;
