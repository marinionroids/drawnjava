import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import DepositModal from './DepositModal';

const Navbar = ({
                    isConnected,
                    isSignedIn,
                    username,
                    level,
                    balance = 0,
                    onConnect,
                    onDisconnect,
                    onTestUser
                }) => {
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const shouldShowBalance = isConnected || isSignedIn;
    const navigate = useNavigate();

    const handleOpenDepositModal = () => {
        setIsDepositModalOpen(true);
        setIsMobileMenuOpen(false);
    };

    const handleCloseDepositModal = () => {
        setIsDepositModalOpen(false);
    };

    const handleProfileClick = () => {
        navigate('/profile');
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50">
                <nav className="bg-gray-900 backdrop-blur-lg bg-opacity-95 shadow-lg relative">
                    <div className="container mx-auto px-4">
                        <div className="h-20 flex items-center justify-between relative">
                            {/* Logo */}
                            <div className="flex items-center shrink-0">
                                <div className="text-4xl font-bold tracking-wider">
                                    <span className="text-yellow-400 mx-2">D</span>
                                    <span className="text-yellow-400 mx-2">R</span>
                                    <span className="text-yellow-400 mx-2">A</span>
                                    <span className="text-yellow-400 mx-2">W</span>
                                    <span className="text-yellow-400 mx-2">N</span>
                                </div>
                            </div>

                            {/* Desktop Navigation */}
                            <div className="hidden lg:block mx-4 shrink-0">
                                <Link
                                    to="/"
                                    className="px-8 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg font-medium text-white hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-lg hover:shadow-yellow-500/30"
                                >
                                    LOOTBOXES
                                </Link>
                            </div>

                            {/* Desktop Right Section */}
                            <div className="hidden lg:flex items-center gap-2 gap-6 shrink-0">
                                {shouldShowBalance && (
                                    <div className="bg-gray-800 rounded-xl flex items-center p-2 lg:p-3 shadow-lg border border-gray-700">
                                        <div className="flex items-center space-x-2">
                                            <div className="text-yellow-500 text-xl">♦</div>
                                            <div className="text-white font-medium">{balance.toFixed(2)}</div>
                                        </div>
                                        <button
                                            onClick={handleOpenDepositModal}
                                            className="ml-2 lg:ml-4 bg-gradient-to-r from-green-500 to-green-600 px-3 lg:px-6 py-2 rounded-lg text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-green-500/30 text-sm lg:text-base"
                                        >
                                            DEPOSIT
                                        </button>
                                    </div>
                                )}

                                {isConnected ? (
                                    <div className="flex items-center gap-2">
                                        <div
                                            onClick={handleProfileClick}
                                            className="flex items-center space-x-2 lg:space-x-3 bg-gray-800 rounded-xl p-2 border border-gray-700 cursor-pointer hover:bg-gray-700 transition-all duration-200"
                                        >
                                            <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg shadow-inner"></div>
                                            <div className="text-gray-200">
                                                <div className="font-medium text-sm lg:text-base">{username}</div>
                                                <div className="text-xs lg:text-sm text-gray-400">LEVEL {level}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={onDisconnect}
                                            className="bg-gradient-to-r from-red-500 to-red-600 px-4 lg:px-6 py-2 rounded-lg text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-red-500/30 text-sm lg:text-base"
                                        >
                                            Disconnect
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={onConnect}
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 lg:px-8 py-2 lg:py-3 rounded-lg text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-blue-500/30 text-sm lg:text-base"
                                        >
                                            Connect
                                        </button>
                                        <button
                                            onClick={onTestUser}
                                            className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 lg:px-8 py-2 lg:py-3 rounded-lg text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-purple-500/30 text-sm lg:text-base"
                                        >
                                            Test User
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={toggleMobileMenu}
                                className="lg:hidden p-2 text-white"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>

                        {/* Mobile Menu */}
                        {isMobileMenuOpen && (
                            <div className="lg:hidden bg-gray-900 border-t border-gray-800 py-4">
                                <div className="space-y-4 px-4">
                                    <Link
                                        to="/"
                                        className="block text-center px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg font-medium text-white hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        LOOTBOXES
                                    </Link>

                                    {shouldShowBalance && (
                                        <div className="bg-gray-800 rounded-xl p-3 shadow-lg border border-gray-700">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <div className="text-yellow-500 text-xl">♦</div>
                                                    <div className="text-white font-medium">{balance.toFixed(2)}</div>
                                                </div>
                                                <button
                                                    onClick={handleOpenDepositModal}
                                                    className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 rounded-lg text-white text-sm hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
                                                >
                                                    DEPOSIT
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {isConnected ? (
                                        <div className="space-y-3">
                                            <div
                                                onClick={handleProfileClick}
                                                className="bg-gray-800 rounded-xl p-3 border border-gray-700 cursor-pointer hover:bg-gray-700 transition-all duration-200"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg shadow-inner"></div>
                                                    <div className="text-gray-200">
                                                        <div className="font-medium">{username}</div>
                                                        <div className="text-sm text-gray-400">LEVEL {level}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    onDisconnect();
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className="w-full bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 rounded-lg text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
                                            >
                                                Disconnect
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => {
                                                    onConnect();
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 rounded-lg text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium"
                                            >
                                                Connect
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onTestUser();
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 rounded-lg text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium"
                                            >
                                                Test User
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </nav>
            </div>

            <DepositModal
                isOpen={isDepositModalOpen}
                onClose={handleCloseDepositModal}
            />
        </>
    );
};

export default Navbar;