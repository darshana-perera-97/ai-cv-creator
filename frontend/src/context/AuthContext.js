import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl, getAuthHeaders, API_CONFIG } from '../config/config';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on app start
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const response = await fetch(getApiUrl('/auth/profile'), {
                        headers: getAuthHeaders(storedToken)
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        setUser(data.user);
                        setToken(storedToken);
                    } else {
                        // Token is invalid, clear it
                        localStorage.removeItem('token');
                        setToken(null);
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch(getApiUrl('/auth/login'), {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.user);
                setToken(data.token);
                localStorage.setItem('token', data.token);
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error occurred' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch(getApiUrl('/auth/register'), {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.user);
                setToken(data.token);
                localStorage.setItem('token', data.token);
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Network error occurred' };
        }
    };

    const logout = () => {
        // Clear localStorage first
        localStorage.removeItem('token');
        
        // Update state
        setUser(null);
        setToken(null);
    };

    const getPlanInfo = async () => {
        try {
            const response = await fetch(getApiUrl('/auth/plan-info'), {
                headers: getAuthHeaders(token)
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, planInfo: data.planInfo };
            } else {
                return { success: false, message: 'Failed to get plan info' };
            }
        } catch (error) {
            console.error('Get plan info error:', error);
            return { success: false, message: 'Network error occurred' };
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        getPlanInfo,
        isAuthenticated: !!token
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 