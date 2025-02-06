import React, { useState, useRef, useEffect } from 'react';
import { Package, Wallet, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { storeReceivingAddress } from '../utils/api';
import bs58 from 'bs58';
import { useModal } from '../contexts/ModalContext';

const Navbar = () => {
    const { user, login, logout } = useAuth();
    const { openDeposit } = useModal();
    const [error, setError] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDisconnect = () => {
        // Remove items from localStorage
        localStorage.removeItem('recieverWalletAddress');
        localStorage.removeItem('auth_token');
        // Call logout from auth context
        logout();
        // Close dropdown
        setIsDropdownOpen(false);
    };

    const handleLogin = async () => {
        try {
            // Check if Solflare is installed
            if (!window.solflare) {
                setError('Please install Solflare wallet');
                return;
            }

            // First try auto-connect, if that fails, request explicit connection
            try {
                await window.solflare.connect({ onlyIfTrusted: true });
            } catch {
                await window.solflare.connect();
            }

            // Generate unique message
            const messageText = `Login to Lootbox App: ${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
            const messageBytes = new TextEncoder().encode(messageText);

            // Get wallet instance and public key
            const wallet = window.solflare;
            const publicKey = wallet.publicKey;

            // Sign the message
            const signResult = await wallet.signMessage(messageBytes);
            const signatureBytes = signResult.signature;
            const signatureBase58 = bs58.encode(signatureBytes);

            // Send to backend for verification
            const response = await fetch('http://localhost:8080/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    walletAddress: publicKey.toString(),
                    message: messageText,
                    signature: signatureBase58
                })
            });

            if (!response.ok) {
                throw new Error('Login verification failed');
            }

            const { token } = await response.json();
            const userData = await login(publicKey.toString(), messageText, signatureBase58);

            if (userData.receivingAddress) {
                storeReceivingAddress(userData.receivingAddress);
            }

        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to login. Please try again.');
        }
    };

    return (
        <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-800/50 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none"></div>

            {/* Logo - Left */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2">
                <div className="flex items-center group">
                    <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                        <Package className="w-8 h-8 text-yellow-400 relative group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300">
                        Flip.gg
                    </span>
                </div>
            </div>

            {/* Center Content */}
            <div className="flex items-center justify-center h-20">
                {/* Lootboxes button here */}
            </div>

            {/* Right Section */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2">
                {user ? (
                    <div className="flex items-center space-x-4">
                        {/* Balance */}
                        <div className="flex items-center bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl px-4 py-2.5">
                            <Wallet className="w-4 h-4 text-yellow-400 mr-2" />
                            <span className="text-gray-400 mr-2 text-sm">BALANCE</span>
                            <span className="text-yellow-400 font-mono font-bold">
                                ◆ {user.balance.toFixed(2)}
                            </span>
                        </div>

                        {/* Deposit Button */}
                        <button
                            onClick={openDeposit}
                            className="relative group overflow-hidden px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium"
                        >
                            <span className="relative z-10">DEPOSIT</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>

                        {/* User Profile with Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <div
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-gray-700/50 transition-colors duration-200"
                            >
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center">
                                        <User className="w-4 h-4 text-gray-900" />
                                    </div>
                                    <span className="ml-2 text-yellow-400 font-medium">
                                        {user.username}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 ml-2 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-gray-800 border border-gray-700/50 shadow-lg overflow-hidden">
                                    <div className="py-1">
                                        <button
                                            className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 text-left flex items-center space-x-2"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            Profile Settings
                                        </button>
                                        <button
                                            className="w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700/50 text-left flex items-center space-x-2"
                                            onClick={handleDisconnect}
                                        >
                                            Disconnect
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleLogin}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 font-medium hover:from-yellow-400 hover:to-yellow-300 transition-all duration-300"
                        >
                            Connect Wallet
                        </button>
                        {error && (
                            <span className="text-red-500 text-sm">{error}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;