import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import DepositForm from './DepositForm';
import WithdrawForm from './WithdrawForm';

const DepositModal = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState('deposit');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setError('');
            setSuccessMessage('');
            setMode('deposit');
        }
    }, [isOpen]);

    // Handle escape key press
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const closeModal = () => {
        setError('');
        setSuccessMessage('');
        setMode('deposit');
        onClose();
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
                        <DepositForm
                            onClose={closeModal}
                            setError={setError}
                            setSuccessMessage={setSuccessMessage}
                        />
                    ) : (
                        <WithdrawForm
                            onClose={closeModal}
                            setError={setError}
                            setSuccessMessage={setSuccessMessage}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DepositModal;