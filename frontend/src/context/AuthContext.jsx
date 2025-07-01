import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';
import LoadingSpinner from '../components/custom/LoadingSpinner';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, check if user is authenticated
    useEffect(() => {
        authAPI.me()
            .then(data => setUser(data.user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = async (credentials) => {
        await authAPI.login(credentials); // sets cookie
        const data = await authAPI.me();
        setUser(data.user);
    };

    const logout = async () => {
        await authAPI.logout();
        setUser(null);
    };

    const register = async (registrationData) => {
        await authAPI.register(registrationData);
    };

    if (loading) {
        return <LoadingSpinner message="Checking authentication..." />;
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
