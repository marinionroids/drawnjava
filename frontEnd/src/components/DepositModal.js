import React, { useState, useEffect } from 'react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import Cookies from "js-cookie";

const DepositModal = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState('deposit'); // 'deposit' or 'withdraw'
    const [amount, setAmount] = useState('');
    const [withdrawAddress, setWithdrawAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Initialize Solana connection (you should move this to a config file)
    const connection = new Connection('https://api.devnet.solana.com');

    // Close modal on escape key
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

            // Get JWT token
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

    const handleDeposit = async () => {
        try {
            setError('');
            setSuccessMessage('');

            // First ensure Solflare is installed
            if (!window.solflare) {
                throw new Error('Please install Solflare wallet');
            }

            // Then try to connect - don't use optional chaining here
            if (!window.solflare.isConnected) {
                try {
                    await window.solflare.connect();
                } catch (err) {
                    throw new Error('Failed to connect to Solflare');
                }
            }

            // Verify we have a valid public key
            if (!window.solflare.publicKey) {
                throw new Error('No wallet connected');
            }

            const depositAmount = parseFloat(amount);
            if (isNaN(depositAmount) || depositAmount <= 0) {
                setError('Please enter a valid amount');
                return;
            }

            setIsLoading(true);

            // Verify the receiver address is valid before creating transaction
            let receiverPubKey;
            try {
                receiverPubKey = new PublicKey(Cookies.get('recievingAddress'));
            } catch (err) {
                throw new Error('Invalid receiver address');
            }

            // Create the transaction
            const transaction = new Transaction();
            transaction.feePayer = window.solflare.publicKey;

            // Get recent blockhash
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;

            // Add transfer instruction
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: window.solflare.publicKey,
                    toPubkey: receiverPubKey,
                    lamports: Math.round(depositAmount * LAMPORTS_PER_SOL)
                })
            );

            // Sign and send transaction
            const { signature } = await window.solflare.signAndSendTransaction(transaction);

            const confirmation = await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight,
            });

            if (confirmation.value.err) {
                throw new Error("Transaction failed!");
            }

            // Get JWT token
            const token = Cookies.get('jwt');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('https://drawngg.com/api/auth/deposit', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sendingWalletAddress: window.solflare.publicKey.toString(),
                    recieverWalletAddress: Cookies.get('recievingAddress'),
                    amount: depositAmount,
                    signature: signature.toString(),
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                // Handle different error types based on the response
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

            // Handle success
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
            <div
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={closeModal}
            />

            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4 relative z-10">
                {/* Header with tabs */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setMode('deposit')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                mode === 'deposit'
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Deposit
                        </button>
                        <button
                            onClick={() => setMode('withdraw')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                mode === 'withdraw'
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Withdraw
                        </button>
                    </div>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Amount ({mode === 'withdraw' ? '♦' : 'SOL'})
                        </label>
                        {mode === 'withdraw' && (
                            <p className="text-lg text-gray-400 mb-2">
                                Enter amount in $ . <br/> Payouts will be converted to SOL.
                                <br /><br /><br />
                                Amount: $</p>
                        )}
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            min={mode === 'withdraw' ? "0.1" : "0"}
                            step="0.01"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                    </div>

                    {mode === 'withdraw' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">
                                Enter your SOL address
                            </label>
                            <input
                                type="text"
                                value={withdrawAddress}
                                onChange={(e) => setWithdrawAddress(e.target.value)}
                                placeholder="SOL address"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900 bg-opacity-50 border border-red-500 rounded-lg p-3 text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-900 bg-opacity-50 border border-green-500 rounded-lg p-3 text-green-200 text-sm">
                            {successMessage}
                        </div>
                    )}


                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={closeModal}
                        className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={mode === 'deposit' ? handleDeposit : handleWithdraw}
                        disabled={!amount || isLoading || (mode === 'withdraw' && !withdrawAddress)}
                        className={`px-6 py-2 rounded-lg ${
                            mode === 'withdraw'
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                        } text-white font-medium 
                        ${(!amount || isLoading || (mode === 'withdraw' && !withdrawAddress))
                            ? 'opacity-50 cursor-not-allowed'
                            : ''} 
                        transition-all duration-200 shadow-lg hover:shadow-green-500/30`}
                    >
                        {isLoading ? 'Processing...' : mode === 'withdraw' ? 'Withdraw SOL' : 'Deposit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DepositModal;