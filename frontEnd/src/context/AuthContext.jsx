// context/AuthContext.jsx
import React, { createContext, useState, useCallback } from 'react';
import bs58 from 'bs58';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [jwt, setJwt] = useState(localStorage.getItem('jwt'));

    const connect = useCallback(async () => {
        try {
            setConnecting(true);

            // Check if Solflare is installed
            if (!window.solflare) {
                throw new Error('Solflare extension not found! Please install it first.');
            }

            // Connect to Solflare
            await window.solflare.connect();

            // Generate a message to sign
            const message = `Sign this message for authentication: ${Date.now()}`;
            const encodedMessage = new TextEncoder().encode(message);

            // Request signature
            const signResult = await window.solflare.signMessage(encodedMessage);
            const signatureBytes = signResult.signature;
            const signatureBase58 = bs58.encode(signatureBytes);

            // Get wallet public key
            const publicKey = window.solflare.publicKey.toString();

            // Send verification request
            const response = await fetch('http://localhost:8080/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    walletAddress: publicKey,
                    message: message,
                    signature: signatureBase58,
                }),
            });

            if (!response.ok) {
                throw new Error('Verification failed');
            }

            const { success, message: responseMessage, data } = await response.json();

            if (!success) {
                throw new Error(responseMessage || 'Authentication failed');
            }

            const { token } = data;

            // Store JWT token
            localStorage.setItem('jwt', token);
            setJwt(token);
            setConnected(true);

        } catch (error) {
            console.error('Connection error:', error);
            alert(error.message);
        } finally {
            setConnecting(false);
        }
    }, []);

    const disconnect = useCallback(() => {
        if (window.solflare) {
            window.solflare.disconnect();
        }
        localStorage.removeItem('jwt');
        setJwt(null);
        setConnected(false);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                connected,
                connecting,
                connect,
                disconnect,
                jwt,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};