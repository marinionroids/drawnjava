import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyToken, getUserData } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(() => localStorage.getItem('auth_token'));

    // Verify token on mount and refresh
    useEffect(() => {
        const verifyAuth = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                await verifyToken(token);
                const userData = await getUserData(token);
                setUser(userData);
                localStorage.setItem('recieverWalletAddress', userData.recievingAddress);

            } catch (error) {
                console.error('Auth verification failed:', error);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('recieverWalletAddress');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, [token]);

    const login = async (walletAddress, signedMessage, signature) => {
        try {
            const response = await fetch('http://localhost:8080/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    walletAddress: walletAddress,
                    message: signedMessage,
                    signature: signature,
                }),
            });

            if (!response.ok) throw new Error('Login failed');

            const { token: newToken } = await response.json();
            localStorage.setItem('auth_token', newToken);
            setToken(newToken);


            // Fetch user data with new token
            const userData = await getUserData(newToken);
            setUser(userData);

            return userData;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('recieverWalletAddress');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        setUser,
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