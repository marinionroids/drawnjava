import React, { useState, useEffect } from 'react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import Cookies from "js-cookie";
import priceIcon from '../../images/priceIcon.png';

const PhantomDeposit = ({ onClose, setError, setSuccessMessage }) => {
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const connection = new Connection(
        'https://solana-mainnet.core.chainstack.com/34501e83ff7f1277b3792422179b8598'
    );
    const receivingAddress = Cookies.get('recievingAddress') || '';

    const handleDeposit = async () => {
        try {
            setError('');
            setSuccessMessage('');
            
            // Validate amount first
            const depositAmountUSD = parseFloat(amount);
            if (isNaN(depositAmountUSD) || depositAmountUSD <= 0) {
                setError('Please enter a valid USD amount');
                return;
            }
            
            setIsLoading(true);
            
            // Simple check for Phantom
            if (!window.phantom?.solana) {
                setError('Phantom wallet not detected. Please install the Phantom extension.');
                setIsLoading(false);
                return;
            }
            
            // Try to connect to Phantom - simple approach
            let publicKey;
            try {
                // This will trigger the connection popup if not connected
                const resp = await window.phantom.solana.connect();
                publicKey = resp.publicKey;
                console.log("Connected to Phantom:", publicKey.toString());
            } catch (err) {
                console.error("Connection error:", err);
                if (err.message.includes("User rejected")) {
                    setError('Connection request was rejected. Please try again.');
                } else {
                    setError('Failed to connect to Phantom. Please try again.');
                }
                setIsLoading(false);
                return;
            }
            
            // Get SOL price
            let solPriceUSD;
            try {
                const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
                const priceData = await priceResponse.json();
                solPriceUSD = priceData.solana.usd;
                
                if (!solPriceUSD || solPriceUSD <= 0) {
                    throw new Error('Could not get valid SOL price');
                }
            } catch (err) {
                console.error('Failed to get SOL price:', err);
                solPriceUSD = 100; // Fallback price
            }
            
            // Calculate amount in SOL
            const depositAmountSOL = Number((depositAmountUSD / solPriceUSD).toFixed(5));
            if (depositAmountSOL < 0.000001) {
                setError('Amount is too small for a transaction');
                setIsLoading(false);
                return;
            }

            // Create transaction
            let receiverPubKey;
            try {
                receiverPubKey = new PublicKey(receivingAddress);
            } catch (err) {
                throw new Error(`Invalid receiver address: ${err.message}`);
            }

            // Get recent blockhash
            let blockhashInfo;
            try {
                const getBlockhash = async (retries = 3) => {
                    try {
                        return await connection.getLatestBlockhash();
                    } catch (err) {
                        console.warn(`Blockhash fetch attempt failed: ${err.message}`);
                        if (retries <= 0) throw err;
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        return getBlockhash(retries - 1);
                    }
                };
                
                blockhashInfo = await getBlockhash();
            } catch (err) {
                console.error("All blockhash fetch attempts failed:", err);
                throw new Error(`Network error: failed to get recent blockhash: ${err.message}`);
            }
            
            const { blockhash, lastValidBlockHeight } = blockhashInfo;

            // Build transaction
            const transaction = new Transaction();
            transaction.feePayer = publicKey;
            transaction.recentBlockhash = blockhash;
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: receiverPubKey,
                    lamports: Math.round(depositAmountSOL * LAMPORTS_PER_SOL)
                })
            );

            // Sign and send transaction
            let signature;
            try {
                console.log("Signing transaction...");
                const result = await window.phantom.solana.signAndSendTransaction(transaction);
                signature = result.signature;
                
                if (!signature) {
                    throw new Error('Transaction was processed but no signature was returned');
                }
                console.log("Transaction signed successfully:", signature);
            } catch (err) {
                console.error("Signing error:", err);
                if (err.message.includes('User rejected')) {
                    throw new Error('Transaction was rejected. Please try again.');
                } else if (err.message.includes('insufficient funds')) {
                    throw new Error('Insufficient funds for transaction');
                }
                throw new Error(`Failed to sign transaction: ${err.message}`);
            }

            // Notify backend
            const token = Cookies.get('jwt');
            if (!token) {
                throw new Error('No authentication token found');
            }

            let retryCount = 0;
            const maxRetries = 10;
            const retryInterval = 5000;

            while (retryCount <= maxRetries) {
                try {
                    console.log(`Notifying backend (attempt ${retryCount + 1}/${maxRetries + 1})`);
                    const response = await fetch('https://drawngg.com/api/auth/deposit', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            sendingWalletAddress: publicKey.toString(),
                            recieverWalletAddress: receivingAddress,
                            amount: depositAmountSOL,
                            signature: signature.toString(),
                        }),
                    });

                    const responseData = await response.json();

                    if (response.ok) {
                        console.log("Deposit processed successfully");
                        setSuccessMessage('Deposit processed successfully!');
                        setTimeout(() => {
                            onClose();
                        }, 1000);
                        return;
                    }

                    if (responseData?.data?.code === 'DUPLICATE_SIGNATURE') {
                        throw new Error('This transaction has already been processed');
                    }

                    if (retryCount < maxRetries) {
                        console.log(`Backend notification failed, retrying in ${retryInterval/1000}s...`);
                        await new Promise(resolve => setTimeout(resolve, retryInterval));
                    } else {
                        throw new Error(responseData.message || 'Failed to process deposit');
                    }
                } catch (err) {
                    if (retryCount >= maxRetries) {
                        console.error("Backend notification failed after all retries:", err);
                        throw new Error(`Failed to process deposit after multiple attempts: ${err.message}`);
                    }
                }
                retryCount++;
            }

        } catch (err) {
            console.error('Deposit error:', err);
            setError(err.message || 'Failed to complete deposit');
        } finally {
            setIsLoading(false);
        }
    };

    return (
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
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3.5 rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transform hover:scale-[1.02] active:scale-[0.98]"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                    </span>
                ) : 'Deposit with Phantom'}
            </button>
        </div>
    );
};

export default PhantomDeposit;