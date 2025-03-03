import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, CheckCircle2, Wallet, AlertCircle } from 'lucide-react';
import Cookies from "js-cookie";
import SolflareDeposit from './wallets/SolflareDeposit';
import PhantomDeposit from './wallets/PhantomDeposit';

const DepositForm = ({ onClose, setError, setSuccessMessage }) => {
    const [depositMethod, setDepositMethod] = useState('manual');
    const [copiedAddress, setCopiedAddress] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [isPromoLoading, setIsPromoLoading] = useState(false);
    const [showAllWallets, setShowAllWallets] = useState(false);

    const receivingAddress = Cookies.get('recievingAddress') || '';
    
    // Get wallet info from cookies
    const walletId = Cookies.get('walletId');
    const walletName = Cookies.get('walletName');
    
    // More reliable way to detect wallet type
    const getConnectedWalletType = () => {
        // First try the new cookie structure
        if (walletId) {
            if (walletId.includes('phantom')) return 'phantom';
            if (walletId.includes('solflare')) return 'solflare';
        }
        
        // Fall back to old way
        const oldWalletType = Cookies.get('walletType');
        if (oldWalletType) return oldWalletType;
        
        // Final fallback based on adapter name
        if (walletName) {
            const lowerName = walletName.toLowerCase();
            if (lowerName.includes('phantom')) return 'phantom';
            if (lowerName.includes('solflare')) return 'solflare';
        }
        
        return 'manual';
    };

    // Set deposit method based on detected wallet type
    useEffect(() => {
        const detectedWallet = getConnectedWalletType();
        setDepositMethod(detectedWallet);
        
        // Log for debugging
        console.log('Detected wallet type:', detectedWallet);
    }, [walletId, walletName]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(receivingAddress);
            setCopiedAddress(true);
            setTimeout(() => setCopiedAddress(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handlePromoCode = async () => {
        try {
            setIsPromoLoading(true);
            setError('');
            setSuccessMessage('');

            const token = Cookies.get('jwt');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('https://drawngg.com/api/auth/code', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: promoCode,
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to process promo code');
            }

            setSuccessMessage('Promo code activated successfully!');
            setPromoCode('');
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);

        } catch (err) {
            console.error('Promo code error:', err);
            setError(err.message || 'Failed to process promo code');
        } finally {
            setIsPromoLoading(false);
        }
    };

    // Get wallet display details
    const getWalletDetails = (type) => {
        switch (type) {
            case 'phantom':
                return {
                    name: 'Phantom',
                    logo: 'https://yt3.googleusercontent.com/0yNbMsS0-rUrtVJmKd6d0xTDmLDEn1qu_KkivaeIC3UmCuXntxE-CJZRhWoy93JXij1YSJFMhA=s160-c-k-c0x00ffffff-no-rj',
                    bgClass: 'bg-purple-500/10',
                    borderClass: 'border-purple-500/50',
                    shadowClass: 'shadow-purple-500/10',
                    buttonBg: 'from-purple-500 to-purple-600',
                    buttonHoverBg: 'from-purple-600 to-purple-700'
                };
            case 'solflare':
                return {
                    name: 'Solflare',
                    logo: 'https://images.sftcdn.net/images/t_app-icon-s/p/f952d0c0-29e2-476e-87e1-819dcba49252/1808597596/solflare-solana-wallet-logo',
                    bgClass: 'bg-blue-500/10',
                    borderClass: 'border-blue-500/50',
                    shadowClass: 'shadow-blue-500/10',
                    buttonBg: 'from-blue-500 to-blue-600',
                    buttonHoverBg: 'from-blue-600 to-blue-700'
                };
            default:
                return {
                    name: 'Manual Transfer',
                    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
                    bgClass: 'bg-yellow-500/10',
                    borderClass: 'border-yellow-500/50',
                    shadowClass: 'shadow-yellow-500/10',
                    buttonBg: 'from-yellow-500 to-yellow-600',
                    buttonHoverBg: 'from-yellow-600 to-yellow-700'
                };
        }
    };

    // Get connected wallet info for UI
    const connectedWalletType = getConnectedWalletType();
    const connectedWalletDetails = getWalletDetails(connectedWalletType);
    
    // Determine which wallet methods to show
    const shouldShowWallet = (walletType) => {
        if (showAllWallets) return true;
        if (walletType === 'manual') return true; // Always show manual method
        if (connectedWalletType === 'manual') return true; // Show all if no wallet connected
        return walletType === connectedWalletType; // Only show connected wallet
    };

    return (
        <div className="grid md:grid-cols-[300px,1fr] gap-8">
            {/* Left Side - Method Selection with Visual Indicator */}
            <div className="space-y-4">
                {/* Connected Wallet Badge */}
                {connectedWalletType !== 'manual' && (
                    <div className={`p-3 rounded-lg ${connectedWalletDetails.bgClass} ${connectedWalletDetails.borderClass} border flex items-center mb-4`}>
                        <Wallet size={16} className="mr-2 text-gray-300" />
                        <span className="text-sm font-medium">Connected with {connectedWalletDetails.name}</span>
                    </div>
                )}
                
                {connectedWalletType !== 'manual' && !showAllWallets && (
                    <div className="flex justify-end mb-2">
                        <button 
                            onClick={() => setShowAllWallets(true)}
                            className="text-xs text-gray-400 hover:text-white underline flex items-center">
                            <span>Show all deposit methods</span>
                        </button>
                    </div>
                )}
                
                {connectedWalletType !== 'manual' && showAllWallets && (
                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/50 mb-4 flex items-center">
                        <AlertCircle size={16} className="mr-2 text-yellow-500" />
                        <span className="text-xs text-yellow-500">
                            Using a different wallet than your connected one may cause issues.
                        </span>
                    </div>
                )}
            
                {shouldShowWallet('solflare') && (
                    <button
                        onClick={() => setDepositMethod('solflare')}
                        className={`w-full flex items-center p-4 rounded-xl border transition-all duration-300 transform hover:scale-[1.02] ${
                            depositMethod === 'solflare'
                                ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                                : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                        }`}
                    >
                        <img
                            src="https://images.sftcdn.net/images/t_app-icon-s/p/f952d0c0-29e2-476e-87e1-819dcba49252/1808597596/solflare-solana-wallet-logo"
                            alt="Solflare"
                            className="w-8 h-8 rounded-full"
                        />
                        <span className="ml-4 text-white font-medium">Solflare Deposit</span>
                        {connectedWalletType === 'solflare' && (
                            <span className="ml-auto bg-blue-500 text-xs font-bold px-2 py-1 rounded-full text-white">CONNECTED</span>
                        )}
                    </button>
                )}
                
                {shouldShowWallet('phantom') && (
                    <button
                        onClick={() => setDepositMethod('phantom')}
                        className={`w-full flex items-center p-4 rounded-xl border transition-all duration-300 transform hover:scale-[1.02] ${
                            depositMethod === 'phantom'
                                ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/10'
                                : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                        }`}
                    >
                        <img
                            src="https://yt3.googleusercontent.com/0yNbMsS0-rUrtVJmKd6d0xTDmLDEn1qu_KkivaeIC3UmCuXntxE-CJZRhWoy93JXij1YSJFMhA=s160-c-k-c0x00ffffff-no-rj"
                            alt="Phantom"
                            className="w-8 h-8 rounded-full"
                        />
                        <span className="ml-4 text-white font-medium">Phantom Deposit</span>
                        {connectedWalletType === 'phantom' && (
                            <span className="ml-auto bg-purple-500 text-xs font-bold px-2 py-1 rounded-full text-white">CONNECTED</span>
                        )}
                    </button>
                )}

                <button
                    onClick={() => setDepositMethod('manual')}
                    className={`w-full flex items-center p-4 rounded-xl border transition-all duration-300 transform hover:scale-[1.02] ${
                        depositMethod === 'manual'
                            ? 'bg-yellow-500/10 border-yellow-500/50 shadow-lg shadow-yellow-500/10'
                            : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                    }`}
                >
                    <img
                        src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
                        alt="Solana"
                        className="w-8 h-8 rounded-full"
                    />
                    <span className="ml-4 text-white font-medium">Manual Transfer</span>
                </button>

                {showAllWallets && (
                    <button 
                        onClick={() => setShowAllWallets(false)}
                        className="w-full text-center text-xs text-gray-400 hover:text-white py-2">
                        Hide alternative wallet methods
                    </button>
                )}

                {/* Promo Code Section */}
                <div className="mt-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                    <h3 className="text-sm font-medium text-white mb-3">Have a Promo Code?</h3>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="Enter your promo code"
                            className="flex-1 bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-200 text-sm"
                        />
                        <button
                            onClick={handlePromoCode}
                            disabled={isPromoLoading || !promoCode}
                            className="px-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 rounded-xl font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                        >
                            {isPromoLoading ? (
                                <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                            ) : 'Apply'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Side - Deposit Form */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                {depositMethod === 'manual' ? (
                    <div className="space-y-6">
                        <p className="text-gray-400 text-center text-sm font-medium">
                            Send only SOL to the provided Address
                        </p>
                        <div className="text-center">
                            <QRCodeSVG
                                value={receivingAddress}
                                size={200}
                                className="mx-auto bg-white p-3 rounded-xl shadow-lg"
                            />
                        </div>
                        <div className="flex items-center space-x-3 bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                            <input
                                type="text"
                                value={receivingAddress}
                                readOnly
                                className="flex-1 bg-transparent text-white text-sm font-mono"
                            />
                            <button
                                onClick={copyToClipboard}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                {copiedAddress ? (
                                    <CheckCircle2 size={20} className="text-green-500" />
                                ) : (
                                    <Copy size={20} className="text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>
                ) : depositMethod === 'solflare' ? (
                    <SolflareDeposit
                        onClose={onClose}
                        setError={setError}
                        setSuccessMessage={setSuccessMessage}
                    />
                ) : (
                    <PhantomDeposit
                        onClose={onClose}
                        setError={setError}
                        setSuccessMessage={setSuccessMessage}
                    />
                )}
            </div>
        </div>
    );
};

export default DepositForm;