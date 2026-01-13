import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || sessionStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await axios.get(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
        } catch (error) {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password, rememberMe = true) => {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        const { token: newToken, user: userData } = response.data;

        if (rememberMe) {
            localStorage.setItem('token', newToken);
            sessionStorage.removeItem('token');
        } else {
            sessionStorage.setItem('token', newToken);
            localStorage.removeItem('token');
        }

        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const register = async (name, email, password, phone) => {
        const response = await axios.post(`${API_URL}/auth/register`, { name, email, password, phone });
        const { token: newToken, user: userData } = response.data;
        // Default to remember me for registration
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const toggleFavorite = async (listingId) => {
        if (!user) return false;

        try {
            const isFavorite = user.favorites?.includes(listingId);
            if (isFavorite) {
                await axios.delete(`${API_URL}/favorites/${listingId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(prev => ({
                    ...prev,
                    favorites: prev.favorites.filter(id => id !== listingId)
                }));
            } else {
                await axios.post(`${API_URL}/favorites/${listingId}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(prev => ({
                    ...prev,
                    favorites: [...(prev.favorites || []), listingId]
                }));
            }
            return true;
        } catch (error) {
            console.error('Favori işlemi başarısız:', error);
            return false;
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        toggleFavorite,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
