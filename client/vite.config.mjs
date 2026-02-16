import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import envCompatible from 'vite-plugin-env-compatible';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        envCompatible(),
    ],
    esbuild: {
        loader: 'jsx',
        include: /src\/.*\.js$/,
        exclude: [],
    },
    optimizeDeps: {
        include: [
            '@mui/material',
            '@mui/material/styles',
            '@mui/icons-material',
            '@mui/lab',
            '@react-google-maps/api',
            'react-redux',
            'react-router-dom',
            '@mui/styles',
            '@mui/material/Paper',
            '@mui/material/InputBase',
            '@mui/material/Divider',
            '@mui/material/IconButton',
        ],
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
            },
        },
    },
    server: {
        port: 3000,
        open: true,
    },
    build: {
        outDir: 'build',
    },
    resolve: {
        alias: {
            // In case there are some specific aliases needed, add them here
        },
    },
});
