import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ isConnected, isSignedIn, username, level, balance = 0, onConnect, onDisconnect, onDeposit }) => {
const shouldShowBalance = isConnected || isSignedIn;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <nav className="bg-gray-900 backdrop-blur-lg bg-opacity-95 shadow-lg relative">
        <div className="container mx-auto px-4">
          <div className="h-20 flex items-center justify-between relative">
            {/* Logo */}
            <div className="flex items-center">
              <svg width="200" height="40" viewBox="0 0 120 40" className="ml-4">
                <text
                  x="10"
                  y="30"
                  fontFamily="Rubik, sans-serif"
                  fontSize="33"
                  fontWeight="bold"
                  fill="#FFD700"
                  className="drop-shadow-lg"
                >
                  D  R  A  W  N
                </text>
              </svg>
            </div>

            {/* Centered Lootboxes button */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Link
                to="/"
                className="px-8 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg font-medium text-white hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-lg hover:shadow-yellow-500/30"
              >
                LOOTBOXES
              </Link>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-6">
              {shouldShowBalance && (
                <div className="bg-gray-800 rounded-xl flex items-center p-3 shadow-lg border border-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className="text-yellow-500 text-xl">♦</div>
                    <div className="text-white font-medium">{balance.toFixed(2)}</div>
                  </div>
                  <button
                    onClick={onDeposit}
                    className="ml-4 bg-gradient-to-r from-green-500 to-green-600 px-6 py-2 rounded-lg text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-green-500/30"
                  >
                    DEPOSIT
                  </button>
                </div>
              )}

              {isConnected ? (
                <div className="flex items-center space-x-3 bg-gray-800 rounded-xl p-2 border border-gray-700">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg shadow-inner"></div>
                  <div className="text-gray-200">
                    <div className="font-medium">{username}</div>
                    <div className="text-sm text-gray-400">LEVEL {level}</div>
                  </div>
                  <button
                    onClick={onDisconnect}
                    className="ml-4 bg-gradient-to-r from-red-500 to-red-600 px-6 py-2 rounded-lg text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-red-500/30"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={onConnect}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-3 rounded-lg text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-blue-500/30"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

    </div>
  );
};

export default Navbar;
