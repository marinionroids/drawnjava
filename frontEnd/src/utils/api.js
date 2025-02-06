const API_URL = 'http://localhost:8080/api';

export const verifyToken = async (token) => {
    const response = await fetch(`${API_URL}/auth/verify`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Token verification failed');
    }

    return response.json();
};

export const getUserData = async (token) => {
    const response = await fetch(`${API_URL}/user`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user data');
    }

    return response.json();
};

// Utility to store receiving address in localStorage
export const storeReceivingAddress = (address) => {
    localStorage.setItem('recieverWalletAddress', address);
};


// In utils/api.js, add this method:
export const sendSolanaDeposit = async (transactionData) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
        throw new Error('Not authenticated');
    }

    const response = await fetch('http://localhost:8080/api/auth/deposit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transactionData)
    });

    if (!response.ok) {
        throw new Error('Failed to process deposit');
    }

    return await response.json();
};