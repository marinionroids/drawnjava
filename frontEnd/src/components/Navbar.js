import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LogIn, Award, Wallet, Plus, ChevronDown } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import DepositModal from './DepositModal';
import priceIcon from '../images/priceIcon.png';

const Navbar = ({
  isConnected,
  isSignedIn,
  username,
  level,
  balance = 0,
  onConnect,
  onDisconnect,
}) => {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const shouldShowBalance = isConnected || isSignedIn;
  const navigate = useNavigate();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        <nav className={`transition-all duration-300 ${isScrolled ? 'bg-gray-900/95 backdrop-blur-lg shadow-xl' : 'bg-gray-900/80 backdrop-blur-md'}`}>
          <div className="container mx-auto px-4 md:px-6">
            <div className="h-20 flex items-center justify-between">
              {/* Logo */}
              <Link to="/lootbox" className="flex items-center space-x-1 group">
                <div className="text-5xl font-extrabold tracking-wider flex">
                  {['D', 'R', 'A', 'W', 'N'].map((letter, index) => (
                    <span 
                      key={index} 
                      className="text-yellow-400 px-0.5 transition-all duration-300 group-hover:animate-pulse"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {letter}
                    </span>
                  ))}
                </div>
              </Link>

              {/* Desktop Navigation - Center */}
              <div className="hidden lg:flex items-center space-x-6">
                {/* Lootboxes link removed */}
              </div>

              {/* Desktop Right Section */}
              <div className="hidden lg:flex items-center space-x-4">
                {shouldShowBalance && (
                  <div className="bg-gray-800/90 rounded-xl flex items-center p-3 shadow-lg border border-gray-700/50">
                    <div className="flex items-center space-x-2">
                      <img src={priceIcon} alt="Price Icon" className="w-5 h-5" />
                      <div className="text-white font-semibold">{balance.toFixed(3)}</div>
                    </div>
                    <button
                      onClick={handleOpenDepositModal}
                      className="ml-4 group relative overflow-hidden bg-green-600 px-6 py-2 rounded-lg text-white transition-all duration-300 font-medium shadow-lg hover:shadow-green-500/30 text-sm"
                    >
                      <span className="absolute top-0 left-0 w-full h-0 transition-all duration-300 opacity-50 bg-green-400 group-hover:h-full"></span>
                      <span className="relative flex items-center">
                        <Plus size={16} className="mr-1" />
                        DEPOSIT
                      </span>
                    </button>
                  </div>
                )}

                {isConnected ? (
                  <div className="flex items-center space-x-3">
                    <div
                      onClick={handleProfileClick}
                      className="flex items-center space-x-3 bg-gray-800/90 rounded-xl p-2 border border-gray-700/50 cursor-pointer hover:bg-gray-700 transition-all duration-200"
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg shadow-inner overflow-hidden">
                        <User size={20} className="text-gray-400" />
                      </div>
                      <div className="text-gray-200">
                        <div className="font-medium text-sm flex items-center">
                          {username}
                          <ChevronDown size={14} className="ml-1 text-gray-400" />
                        </div>
                        <div className="text-xs text-gray-400 flex items-center">
                          <Award size={12} className="mr-1 text-yellow-500" /> LEVEL {level}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-3">
                    <WalletMultiButton className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2.5 rounded-lg text-white transition-all duration-300 font-medium shadow-lg hover:shadow-blue-500/30 text-sm group" />
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 text-white focus:outline-none rounded-lg hover:bg-gray-800 transition-colors duration-200"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-gray-900 border-t border-gray-800 py-4 px-4 shadow-2xl transition-all duration-300">
              <div className="space-y-4">
                {shouldShowBalance && (
                  <div className="bg-gray-800/90 rounded-xl p-4 shadow-lg border border-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Wallet size={18} className="text-yellow-500 mr-2" />
                        <div className="text-white font-medium text-lg">{balance.toFixed(2)}</div>
                        <img src={priceIcon} alt="Price Icon" className="w-4 h-4 ml-1" />
                      </div>
                      <button
                        onClick={handleOpenDepositModal}
                        className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 rounded-lg text-white text-sm hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium flex items-center"
                      >
                        <Plus size={16} className="mr-1" />
                        DEPOSIT
                      </button>
                    </div>
                  </div>
                )}

                {isConnected ? (
                  <div className="space-y-3">
                    <div
                      onClick={handleProfileClick}
                      className="bg-gray-800/90 rounded-xl p-4 border border-gray-700/50 cursor-pointer hover:bg-gray-700 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg shadow-inner">
                          <User size={24} className="text-gray-400" />
                        </div>
                        <div className="text-gray-200">
                          <div className="font-medium text-lg">{username}</div>
                          <div className="text-sm text-gray-400 flex items-center">
                            <Award size={14} className="mr-1 text-yellow-500" />
                            LEVEL {level}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <WalletMultiButton className="w-full bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 rounded-lg text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium flex items-center justify-center" />
                  </div>
                )}
              </div>
            </div>
          )}
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