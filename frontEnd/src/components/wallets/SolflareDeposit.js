import React, { useState } from 'react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import Cookies from "js-cookie";
import priceIcon from '../../images/priceIcon.png';

const SolflareDeposit = ({ onClose, setError, setSuccessMessage }) => {
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
            
            // Simple check for Solflare
            if (!window.solflare) {
                setError('Solflare wallet not detected. Please install the Solflare extension.');
                setIsLoading(false);
                return;
            }
            
            // Try to connect to Solflare - simple approach
            let publicKey;
            try {
                // This will trigger the connection popup if not connected
                await window.solflare.connect();
                // Add a small delay to ensure connection is complete
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Get the public key
                publicKey = await window.solflare.publicKey;
                if (!publicKey) {
                    throw new Error('Could not retrieve public key from Solflare');
                }
                console.log("Connected to Solflare:", publicKey.toString());
                
                // Save wallet type
                Cookies.set('walletType', 'solflare', { expires: 1 });
            } catch (err) {
                console.error("Connection error:", err);
                if (err.message?.includes("User rejected")) {
                    setError('Connection request was rejected. Please try again.');
                } else {
                    setError('Failed to connect to Solflare. Please try again.');
                }
                setIsLoading(false);
                return;
            }
            
            // Get SOL price with error handling and retry
            let solPriceUSD;
            try {
                const fetchPrice = async (retries = 3) => {
                    try {
                        const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
                        if (!priceResponse.ok) {
                            throw new Error(`Price API returned ${priceResponse.status}`);
                        }
                        const priceData = await priceResponse.json();
                        return priceData.solana.usd;
                    } catch (err) {
                        if (retries <= 0) throw err;
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        return fetchPrice(retries - 1);
                    }
                };
                
                solPriceUSD = await fetchPrice();
                
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

            // Get recent blockhash with retry mechanism
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
                // Try up to 3 times with a small delay between attempts
                let result;
                let retryCount = 0;
                const maxRetries = 2;
                
                while (retryCount <= maxRetries) {
                    try {
                        result = await window.solflare.signAndSendTransaction(transaction);
                        break;
                    } catch (signingError) {
                        console.error(`Signing attempt ${retryCount + 1} failed:`, signingError);
                        retryCount++;
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
                console.log("Transaction signed successfully:", signature);
            } catch (err) {
                console.error("Signing error:", err);
                if (err.message?.includes('User rejected')) {
                    throw new Error('Transaction was rejected. Please try again.');
                } else if (err.message?.includes('insufficient funds')) {
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

                    if (!response.ok) {
                        const responseData = await response.json();
                        
                        if (responseData?.data?.code === 'DUPLICATE_SIGNATURE') {
                            throw new Error('This transaction has already been processed');
                        }
                        
                        if (retryCount < maxRetries) {
                            console.log(`Backend notification failed, retrying in ${retryInterval/1000}s...`);
                            await new Promise(resolve => setTimeout(resolve, retryInterval));
                            retryCount++;
                            continue;
                        } else {
                            throw new Error(responseData.message || 'Failed to process deposit');
                        }
                    }
                    
                    const responseData = await response.json();
                    console.log("Deposit processed successfully");
                    setSuccessMessage('Deposit processed successfully!');
                    setTimeout(() => {
                        onClose();
                    }, 1000);
                    return;
                    
                } catch (err) {
                    if (retryCount >= maxRetries) {
                        console.error("Backend notification failed after all retries:", err);
                        throw new Error(`Failed to process deposit after multiple attempts: ${err.message}`);
                    }
                    retryCount++;
                }
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
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transform hover:scale-[1.02] active:scale-[0.98]"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                    </span>
                ) : 'Deposit with Solflare'}
            </button>
        </div>
    );
};

export default SolflareDeposit;