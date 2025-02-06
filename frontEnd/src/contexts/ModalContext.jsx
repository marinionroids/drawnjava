// contexts/ModalContext.jsx
import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

export const ModalProvider = ({ children }) => {
    const [isDepositOpen, setIsDepositOpen] = useState(false);

    const openDeposit = () => setIsDepositOpen(true);
    const closeDeposit = () => setIsDepositOpen(false);

    return (
        <ModalContext.Provider value={{ isDepositOpen, openDeposit, closeDeposit }}>
            {children}
        </ModalContext.Provider>
    );
};