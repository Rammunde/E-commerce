import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#2874f0', // Flipkart Blue
        },
        secondary: {
            main: '#fb641b', // Flipkart Orange
        },
        background: {
            default: '#f1f3f6', // Light Gray
            paper: '#ffffff',
        },
        text: {
            primary: '#212121',
            secondary: '#878787',
        },
    },
    typography: {
        fontFamily: [
            'Roboto',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 4px 0 rgba(0,0,0,.08)',
                },
            },
        },
    },
});

export default theme;
