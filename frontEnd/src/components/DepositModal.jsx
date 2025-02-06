// DepositModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

export const DepositModal = () => {
    const { isDepositOpen, closeDeposit } = useModal();
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const connection = new Connection("https://api.devnet.solana.com");

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
                receiverPubKey = new PublicKey(localStorage.getItem('recieverWalletAddress'));
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
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('http://localhost:8080/api/auth/deposit', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sendingWalletAddress: window.solflare.publicKey.toString(),
                    recieverWalletAddress: localStorage.getItem('recieverWalletAddress'),
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
                closeDeposit();
                // Optionally refresh user data or balance here
            }, 2000);

        } catch (err) {
            console.error('Deposit error:', err);
            setError(err.message || 'Failed to complete deposit');
        } finally {
            setIsLoading(false);
        }
    };

    // Reset states when modal opens/closes
    useEffect(() => {
        if (isDepositOpen) {
            setAmount('');
            setError('');
            setSuccessMessage('');
            setIsLoading(false);
        }
    }, [isDepositOpen]);

    if (!isDepositOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={closeDeposit}
            />

            {/* Modal wrapper for perfect centering */}
            <div className="flex items-center justify-center min-h-screen p-4">
                {/* Modal */}
                <div className="relative w-full max-w-md transform transition-all bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                            <img
                                src="/solana-sol-logo.svg"
                                alt="Solana Logo"
                                className="w-6 h-6"
                            />
                            <h2 className="text-xl font-bold text-white">Deposit SOL</h2>
                        </div>
                        <button
                            onClick={closeDeposit}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-sm text-red-500">{error}</p>
                            </div>
                        )}

                        {successMessage && (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <p className="text-sm text-green-500">{successMessage}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-200">
                                Amount (SOL)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount..."
                                disabled={isLoading}
                                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg
                                        text-white placeholder-gray-400 focus:outline-none focus:ring-2
                                        focus:ring-yellow-500/50 focus:border-yellow-500
                                        disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <button
                            onClick={handleDeposit}
                            disabled={isLoading || !!successMessage}
                            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-400
                                    text-gray-900 font-medium hover:from-yellow-400 hover:to-yellow-300
                                    transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Processing...' : successMessage ? 'Completed!' : 'Deposit'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};