// App.jsx
import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';
import Navbar from './components/Navbar';
import { DepositModal } from './components/DepositModal';

const App = () => {
    return (
        <AuthProvider>
            <ModalProvider>
                <div className="min-h-screen bg-gray-900">
                    <Navbar />
                    <DepositModal />
                    {/* Other content */}
                </div>
            </ModalProvider>
        </AuthProvider>
    );
};

export default App;