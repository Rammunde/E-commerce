import React, { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/appSlice';

const IdleTimer = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.app.user);
    const timeoutRef = useRef(null);

    // 15 minutes in milliseconds
    const IDLE_TIMEOUT = 15 * 60 * 1000;

    const handleLogout = useCallback(() => {
        dispatch(logout());
        navigate('/login');
    }, [dispatch, navigate]);

    const resetTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Only set timer if user is logged in
        const auth = sessionStorage.getItem('user');
        if (auth || (user && Object.keys(user).length > 0)) {
            timeoutRef.current = setTimeout(() => {
                console.log('User idle for 15 minutes. Logging out...');
                handleLogout();
            }, IDLE_TIMEOUT);
        }
    }, [handleLogout, user, IDLE_TIMEOUT]);

    useEffect(() => {
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click'
        ];

        const handleActivity = () => {
            resetTimer();
        };

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Initialize timer
        resetTimer();

        // Cleanup
        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [resetTimer]);

    return null; // This component doesn't render anything
};

export default IdleTimer;
