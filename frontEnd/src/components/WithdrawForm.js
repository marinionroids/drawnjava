import React, { useState } from 'react';
import Cookies from "js-cookie";
import priceIcon from '../images/priceIcon.png';

const WithdrawForm = ({ onClose, setError, setSuccessMessage }) => {
    const [amount, setAmount] = useState('');
    const [withdrawAddress, setWithdrawAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
                onClose();
            }, 1000);

        } catch (err) {
            console.error('Withdrawal error:', err);
            setError(err.message || 'Failed to complete withdrawal');
        } finally {
            setIsLoading(false);
        }
    };

    return (
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
    );
};

export default WithdrawForm; 