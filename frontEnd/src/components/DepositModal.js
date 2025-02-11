import React, { useState, useEffect } from 'react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import Cookies from "js-cookie";

const DepositModal = ({ isOpen, onClose }) => {
    const [amount, setAmount] = useState('');
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

    const closeDeposit = () => {
        setAmount('');
        setError('');
        setSuccessMessage('');
        onClose();
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

            const response = await fetch('http://localhost:8080/api/auth/deposit', {
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
                closeDeposit();
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
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={closeDeposit}
            />

            {/* Modal */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4 relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Deposit Funds</h2>
                    <button
                        onClick={closeDeposit}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Amount to Deposit (SOL)
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            min="0"
                            step="0.01"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                    </div>

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
                        onClick={closeDeposit}
                        className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDeposit}
                        disabled={!amount || isLoading}
                        className={`px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-medium 
              ${!amount || isLoading
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:from-green-600 hover:to-green-700'} 
              transition-all duration-200 shadow-lg hover:shadow-green-500/30`}
                    >
                        {isLoading ? 'Processing...': "Deposit"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DepositModal