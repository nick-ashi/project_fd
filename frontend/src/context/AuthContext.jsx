/* eslint-disable no-unused-vars,react-refresh/only-export-components */
/**
 * AUTHCONTEXT.JSX NOTES
 *
 * Purposes:
 * - Store curr user info
 * - One AuthContext --> gonna be used by ALL components
 * - Provide login/logout functions
 * - Track auth state
 * - Akin to UserService in the backend
 *
 * Personal notes:
 * - localStorage = stored in browser
 */

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

// Create context
const AuthContext = createContext(null);

// Custom HOOK to use AUTH context
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

// Provider component ; this thing wraps around the WHOLE app
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user alr logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // We HaVe a TokEn WOOOOOOO
            fetchUserInfo();
        } else {
            setLoading(false);
        }
    }, []);

    //
    const fetchUserInfo = async () => {
        try {
            const res = await api.get('/users/me');
            setUser(res.data);
        } catch (err) {
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // LOGIN using endpoint /auth/login
    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token } = res.data;

        localStorage.setItem('token', token);

        await fetchUserInfo();
    }

    // REGISTER using endpoint /auth/register
    const register = async (email, password, firstName, lastName) => {
        await api.post('/auth/register', {
            email,
            password,
            firstName,
            lastName
        });

        // Auto login after reg
        await login(email, password);
    }

    // LOGOUT
    const logout = async () => {
        localStorage.removeItem('token');
        setUser(null);
    }

    // VALUES provided to all components
    const values = {
        user,
        login,
        register,
        logout,
        // not not user lmao
        isAuthenticated: !!user,
        loading,
    };

    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    );


}