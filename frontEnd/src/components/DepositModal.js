import React, { useState, useEffect } from 'react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import { QRCodeSVG } from 'qrcode.react';
import { useWallet } from '@solana/wallet-adapter-react';
import Cookies from "js-cookie";
import { Wallet, Copy, ArrowRight, AlertCircle, CheckCircle2, X } from 'lucide-react';
import priceIcon from '../images/priceIcon.png';

const DepositModal = ({ isOpen, onClose }) => {
    const { publicKey, signAndSendTransaction, wallet } = useWallet();
    const [mode, setMode] = useState('deposit');
    const [depositMethod, setDepositMethod] = useState('manual');
    const [amount, setAmount] = useState('');
    const [withdrawAddress, setWithdrawAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [copiedAddress, setCopiedAddress] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [isPromoLoading, setIsPromoLoading] = useState(false);

    const receivingAddress = Cookies.get('recievingAddress') || '';
    const connection = new Connection('https://api.devnet.solana.com');

    // Detect wallet type
    const walletName = wallet?.adapter?.name?.toLowerCase() || '';
    const isPhantom = walletName.includes('phantom');
    const isSolflare = walletName.includes('solflare');

    // Set default deposit method based on connected wallet
    useEffect(() => {
        if (isSolflare) {
            setDepositMethod('solflare');
        } else if (isPhantom) {
            setDepositMethod('phantom');
        }
    }, [isSolflare, isPhantom]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const closeModal = () => {
        setAmount('');
        setWithdrawAddress('');
        setError('');
        setSuccessMessage('');
        setMode('deposit');
        onClose();
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(receivingAddress);
            setCopiedAddress(true);
            setTimeout(() => setCopiedAddress(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleWithdraw = async () => {
        try {
            setError('');
            setSuccessMessage('');

            const withdrawAmount = parseFloat(amount);
            if (isNaN(withdrawAmount) || withdrawAmount < 0.1) {
                setError('Minimum withdrawal amount is 0.1');
                return;
            }

            if (!withdrawAddress) {
                setError('Please enter a valid SOL address');
                return;
            }

            setIsLoading(true);

            const token = Cookies.get('jwt');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('https://drawngg.com/api/auth/withdraw', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    toWallet: withdrawAddress,
                    amountInUSD: withdrawAmount,
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to process withdrawal');
            }

            setSuccessMessage('Withdrawal request submitted successfully!');
            setTimeout(() => {
                closeModal();
            }, 1000);

        } catch (err) {
            console.error('Withdrawal error:', err);
            setError(err.message || 'Failed to complete withdrawal');
        } finally {
            setIsLoading(false);
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

    const handleDeposit = async () => {
        try {
            setError('');
            setSuccessMessage('');

            // First ensure wallet is connected and get public key
            if (!publicKey) {
                try {
                    // Try to connect wallet
                    if (wallet?.adapter?.connect) {
                        await wallet.adapter.connect();
                        // Wait for connection to establish and public key to be available
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        // If still no public key, try to get it directly from wallet
                        if (!publicKey) {
                            if (isPhantom && window.phantom?.solana?.publicKey) {
                                console.log("Using public key directly from Phantom wallet");
                            } else if (isSolflare && window.solflare?.publicKey) {
                                console.log("Using public key directly from Solflare wallet");
                            } else {
                                throw new Error('Wallet connected but public key not available. Please try again.');
                            }
                        }
                    } else {
                        throw new Error('No wallet adapter available');
                    }
                } catch (err) {
                    console.error('Wallet connection error:', err);
                    throw new Error(`Could not connect wallet: ${err.message}`);
                }
            }

            // Validate deposit amount (USD)
            const depositAmountUSD = parseFloat(amount);
            if (isNaN(depositAmountUSD) || depositAmountUSD <= 0) {
                setError('Please enter a valid USD amount');
                return;
            }

            setIsLoading(true);
            
            // Get current SOL price in USD
            let solPriceUSD;
            try {
                const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
                const priceData = await priceResponse.json();
                solPriceUSD = priceData.solana.usd;
                
                if (!solPriceUSD || solPriceUSD <= 0) {
                    throw new Error('Could not get valid SOL price');
                }
                
                console.log(`Current SOL price: ${solPriceUSD} USD`);
            } catch (err) {
                console.error('Failed to get SOL price:', err);
                solPriceUSD = 100; // Default fallback value
                console.log(`Using fallback SOL price: ${solPriceUSD} USD`);
            }
            
            // Convert USD amount to SOL
            const depositAmountSOL = Number((depositAmountUSD / solPriceUSD).toFixed(5));
            console.log(`Converting ${depositAmountUSD} USD to ${depositAmountSOL} SOL`);
            
            if (depositAmountSOL < 0.000001) {
                setError('Amount is too small for a transaction');
                setIsLoading(false);
                return;
            }

            // Verify the receiver address is valid
            let receiverPubKey;
            try {
                receiverPubKey = new PublicKey(receivingAddress);
            } catch (err) {
                throw new Error(`Invalid receiver address: ${err.message}`);
            }

            // Create the transaction
            const transaction = new Transaction();
            
            // Get the actual public key to use
            let actualPublicKey = publicKey;
            if (!actualPublicKey) {
                if (isPhantom && window.phantom?.solana?.publicKey) {
                    actualPublicKey = window.phantom.solana.publicKey;
                } else if (isSolflare && window.solflare?.publicKey) {
                    actualPublicKey = window.solflare.publicKey;
                } else {
                    throw new Error('Unable to retrieve public key from wallet. Please try again.');
                }
            }
            
            transaction.feePayer = actualPublicKey;

            // Get recent blockhash with retry logic
            let blockhashInfo;
            try {
                blockhashInfo = await connection.getLatestBlockhash('finalized');
            } catch (err) {
                console.error('Failed to get recent blockhash:', err);
                throw new Error(`Network error: ${err.message}`);
            }
            
            const { blockhash, lastValidBlockHeight } = blockhashInfo;
            transaction.recentBlockhash = blockhash;

            // Add transfer instruction
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: actualPublicKey,
                    toPubkey: receiverPubKey,
                    lamports: Math.round(depositAmountSOL * LAMPORTS_PER_SOL)
                })
            );

            let signature;
            
            // Handle different wallet types
            if (isSolflare) {
                try {
                    if (!window.solflare?.isConnected) {
                        await window.solflare.connect();
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                    
                    let retryCount = 0;
                    const maxRetries = 2;
                    let result;
                    
                    while (retryCount <= maxRetries) {
                        try {
                            result = await window.solflare.signAndSendTransaction(transaction);
                            break;
                        } catch (signingError) {
                            retryCount++;
                            console.log(`Solflare signing attempt ${retryCount} failed:`, signingError);
                            
                            if (retryCount > maxRetries) {
                                throw signingError;
                            }
                            
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                    }
                    
                    if (!result || !result.signature) {
                        throw new Error('Transaction was signed but no signature was returned');
                    }
                    
                    signature = result.signature;
                } catch (err) {
                    console.error('Solflare transaction error:', err);
                    throw new Error(`Failed to sign transaction with Solflare: ${err.message}`);
                }
            } else if (isPhantom) {
                try {
                    // Only check connection once
                    if (!window.phantom?.solana?.isConnected) {
                        await window.phantom.solana.connect();
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    
                    // Single attempt to sign and send transaction
                    const result = await window.phantom.solana.signAndSendTransaction(transaction);
                    
                    if (!result || !result.signature) {
                        throw new Error('Transaction was signed but no signature was returned');
                    }
                    
                    signature = result.signature;
                } catch (err) {
                    console.error('Phantom transaction error:', err);
                    throw new Error(`Failed to sign transaction with Phantom: ${err.message}`);
                }
            } else {
                throw new Error('Unsupported wallet type');
            }

            // Confirm transaction with timeout
            const timeoutSeconds = 60;
            const startTime = Date.now();
            
            let confirmation;
            try {
                confirmation = await Promise.race([
                    connection.confirmTransaction({
                        signature,
                        blockhash,
                        lastValidBlockHeight,
                    }),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Transaction confirmation timeout')), 
                        timeoutSeconds * 1000)
                    )
                ]);
            } catch (err) {
                console.error('Transaction confirmation error:', err);
                throw new Error(`Transaction might have been submitted but could not be confirmed: ${err.message}`);
            }

            if (confirmation.value?.err) {
                console.error('Transaction error:', confirmation.value.err);
                throw new Error(`Transaction failed: ${confirmation.value.err}`);
            }

            // Get JWT token
            const token = Cookies.get('jwt');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Backend API call with retry mechanism
            let response;
            let responseData;
            let retryCount = 0;
            const maxRetries = 10;
            const retryInterval = 5000; // 5 seconds in milliseconds

            while (retryCount <= maxRetries) {
                try {
                    response = await fetch('https://drawngg.com/api/auth/deposit', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            sendingWalletAddress: actualPublicKey.toString(),
                            recieverWalletAddress: receivingAddress,
                            amount: depositAmountSOL,
                            signature: signature.toString(),
                        }),
                    });

                    responseData = await response.json();

                    if (response.ok) {
                        break; // Success, exit the retry loop
                    }

                    // If we get here, the request failed but didn't throw an error
                    if (retryCount < maxRetries) {
                        console.log(`Attempt ${retryCount + 1} failed. Retrying in 5 seconds...`);
                        await new Promise(resolve => setTimeout(resolve, retryInterval));
                    }
                } catch (err) {
                    console.error(`API call error (attempt ${retryCount + 1}):`, err);
                    if (retryCount < maxRetries) {
                        console.log(`Retrying in 5 seconds...`);
                        await new Promise(resolve => setTimeout(resolve, retryInterval));
                    } else {
                        throw new Error(`Network error when processing deposit after ${maxRetries} attempts: ${err.message}`);
                    }
                }
                retryCount++;
            }

            if (!response.ok) {
                switch (responseData?.data?.code) {
                    case 'DUPLICATE_SIGNATURE':
                        throw new Error('This transaction has already been processed');
                    case 'INVALID_TOKEN':
                        throw new Error('Your session has expired. Please login again');
                    case 'INVALID_DEPOSIT':
                        throw new Error('Unable to verify the deposit. Please try again');
                    default:
                        throw new Error(responseData.message || 'Failed to process deposit');
                }
            }

            setSuccessMessage('Deposit processed successfully!');
            setTimeout(() => {
                closeModal();
            }, 1000);

        } catch (err) {
            console.error('Deposit error:', err);
            setError(err.message || 'Failed to complete deposit');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

            <div className="relative bg-gray-900 rounded-2xl w-[800px] h-[600px] overflow-hidden shadow-2xl border border-gray-700/50 transform transition-all duration-300 scale-100 animate-fadeIn">
                {/* Header */}
                <div className="relative px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700/50">
                    <div className="flex justify-between items-center">
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setMode('deposit')}
                                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                                    mode === 'deposit'
                                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 shadow-lg shadow-yellow-500/20'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                }`}
                            >
                                Deposit
                            </button>
                            <button
                                onClick={() => setMode('withdraw')}
                                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                                    mode === 'withdraw'
                                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 shadow-lg shadow-yellow-500/20'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                }`}
                            >
                                Withdraw
                            </button>
                        </div>
                        <button
                            onClick={closeModal}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 h-[calc(100%-64px)] overflow-y-auto">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center text-red-500 animate-shake">
                            <AlertCircle size={20} className="mr-3 flex-shrink-0" />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl flex items-center text-green-500 animate-fadeIn">
                            <CheckCircle2 size={20} className="mr-3 flex-shrink-0" />
                            <p className="font-medium">{successMessage}</p>
                        </div>
                    )}

                    {mode === 'deposit' ? (
                        <div className="grid md:grid-cols-[300px,1fr] gap-8">
                            {/* Left Side - Method Selection */}
                            <div className="space-y-4">
                                {isSolflare && (
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
                                    </button>
                                )}
                                
                                {isPhantom && (
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
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Amount <img src={priceIcon} alt="Price" className="inline-block w-4 h-4 ml-1" />
                                            </label>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="Enter amount"
                                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-200"
                                            />
                                        </div>
                                        <button
                                            onClick={handleDeposit}
                                            disabled={isLoading}
                                            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 py-3.5 rounded-xl font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 transform hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center justify-center">
                                                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    Processing...
                                                </span>
                                            ) : 'Deposit Now'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 max-w-md mx-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Amount <img src={priceIcon} alt="Price" className="inline-block w-4 h-4 ml-1" />
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Withdrawal Address
                                </label>
                                <input
                                    type="text"
                                    value={withdrawAddress}
                                    onChange={(e) => setWithdrawAddress(e.target.value)}
                                    placeholder="Enter SOL address"
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-200 font-mono"
                                />
                            </div>
                            <button
                                onClick={handleWithdraw}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 py-3.5 rounded-xl font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Processing...
                                    </span>
                                ) : 'Withdraw Now'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DepositModal;