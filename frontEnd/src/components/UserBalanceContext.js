import React, { createContext, useContext, useState } from 'react';
import Cookies from "js-cookie";

const UserBalanceContext = createContext();

export const UserBalanceProvider = ({ children }) => {
    const [balance, setBalance] = useState(0);

    const updateBalance = (newBalance) => {
        setBalance(newBalance);
    };

    const updateBalanceFromServer = async () => {
        try {
            const jwt = Cookies.get('jwt');
            if (!jwt) return;

            const response = await fetch("https://drawngg.com/api/user", {
                headers: {
                    "Authorization": `Bearer ${jwt}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const { data } = await response.json();
            setBalance(data.balance);
        } catch (error) {
            console.error("Error updating balance:", error);
        }
    };

    return (
        <UserBalanceContext.Provider value={{ balance, updateBalance, updateBalanceFromServer }}>
            {children}
        </UserBalanceContext.Provider>
    );
};

export const useUserBalance = () => {
    const context = useContext(UserBalanceContext);
    if (!context) {
        throw new Error('useUserBalance must be used within a UserBalanceProvider');
    }
    return context;
};