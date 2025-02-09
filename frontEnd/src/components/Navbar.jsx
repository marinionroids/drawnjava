// components/Navbar.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { connected, connecting, connect, disconnect } = useContext(AuthContext);

    return (
        <nav className="bg-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0">
                        <h1 className="text-xl font-bold">Your App</h1>
                    </div>
                    <div>
                        {!connected ? (
                            <button
                                onClick={connect}
                                disabled={connecting}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                            >
                                {connecting ? 'Connecting...' : 'Connect Wallet'}
                            </button>
                        ) : (
                            <button
                                onClick={disconnect}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Disconnect
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;