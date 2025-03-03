// Profile.jsx
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { 
  LogOut, 
  Trophy, 
  Wallet, 
  Clock, 
  User, 
  Edit2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Gift, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  DollarSign,
  BarChart4
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [username, setUsername] = useState('');
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [currentPage, setCurrentPage] = useState({
        deposits: 1,
        withdrawals: 1,
        lootboxes: 1
    });
    const [isLoading, setIsLoading] = useState(true);
    const [solPrice, setSolPrice] = useState(null);
    const itemsPerPage = 6;
    const navigate = useNavigate();
    const jwt = Cookies.get('jwt');

    useEffect(() => {
        const fetchSolPrice = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
                const data = await response.json();
                setSolPrice(data.solana.usd);
            } catch (error) {
                console.error('Error fetching SOL price:', error);
                // Fallback to a default price if API fails
                setSolPrice(100);
            }
        };

        fetchSolPrice();
        // Update price every 5 minutes
        const interval = setInterval(fetchSolPrice, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            try {
                // Make sure we have a JWT before making the request
                const currentJwt = Cookies.get('jwt');
                
                if (!currentJwt) {
                    console.error("No JWT found in cookies");
                    setIsLoading(false);
                    return; // Don't redirect, just return
                }
                
                // Log the attempt to fetch data
                console.log("Fetching profile data...");
                
                const response = await fetch("https://drawngg.com/api/profile", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${currentJwt}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    console.error(`HTTP error! status: ${response.status}`);
                    setIsLoading(false);
                    return; // Don't redirect, just return
                }

                const responseData = await response.json();
                console.log("Received profile data:", responseData);
                
                // Directly set the data from the response
                // The API returns a structure with { success, message, data } where data contains the actual user info
                if (responseData && responseData.success && responseData.data) {
                    setUserData(responseData.data);
                    setUsername(responseData.data.username || '');
                } else {
                    console.error("Invalid response format:", responseData);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const currentJwt = Cookies.get('jwt');
            
            if (!currentJwt) {
                console.error("No JWT found in cookies");
                setIsSaving(false);
                return;
            }
            
            const response = await fetch('https://drawngg.com/api/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentJwt}`
                },
                body: JSON.stringify({ username }),
            });

            if (!response.ok) {
                throw new Error('Failed to update username');
            }

            setIsEditing(false);
            // Reload the page to refresh the user data
            window.location.reload();
        } catch (error) {
            console.error('Error updating username:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDisconnect = () => {
        // Clear all cookies
        Object.keys(Cookies.get()).forEach(cookie => {
            Cookies.remove(cookie);
        });
        
        // Clear localStorage
        localStorage.clear();
        
        // Refresh the page
        navigate('/lootbox');
        window.location.reload();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    const formatSol = (value) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4
        }).format(value) + ' SOL';
    };

    const truncateAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    };

    const calculateRoi = () => {
        if (!userData || !userData.totalDeposit || userData.totalDeposit === 0) return 0;
        return (((userData.totalWithdraw || 0) - (userData.totalDeposit || 0)) / userData.totalDeposit) * 100;
    };

    // Helper function to safely access nested properties
    const safeGetArray = (obj, path) => {
        if (!obj) return [];
        const properties = path.split('.');
        let result = obj;
        
        for (const prop of properties) {
            if (result === null || result === undefined) {
                return [];
            }
            result = result[prop];
        }
        
        return Array.isArray(result) ? result : [];
    };

    const calculateProfit = () => {
        if (!userData) return 0;
        return (userData.totalWithdraw || 0) - (userData.totalDeposit || 0);
    };

    // Get arrays safely to prevent errors
    const depositTransactions = safeGetArray(userData, 'depositTransactions').sort((a, b) => 
        new Date(b.transactionDate) - new Date(a.transactionDate)
    );
    const withdrawTransactions = safeGetArray(userData, 'withdrawTransactions').sort((a, b) => 
        new Date(b.transactionDate) - new Date(a.transactionDate)
    );
    const lootboxHistory = safeGetArray(userData, 'userLootboxOpeningHistory').sort((a, b) => 
        new Date(b.timeOpened) - new Date(a.timeOpened)
    );

    // Pagination calculations
    const boxPagination = Math.ceil(lootboxHistory.length / itemsPerPage) || 1;
    const depositPagination = Math.ceil(depositTransactions.length / itemsPerPage) || 1;
    const withdrawPagination = Math.ceil(withdrawTransactions.length / itemsPerPage) || 1;

    // Pagination handlers
    const handleNextPage = (type) => {
        setCurrentPage(prev => ({
            ...prev,
            [type]: Math.min(prev[type] + 1, 
                type === 'lootboxes' ? boxPagination : 
                type === 'deposits' ? depositPagination : withdrawPagination)
        }));
    };

    const handlePrevPage = (type) => {
        setCurrentPage(prev => ({
            ...prev,
            [type]: Math.max(prev[type] - 1, 1)
        }));
    };

    // Filter transactions for current page
    const getCurrentItems = (items, type) => {
        if (!items || !Array.isArray(items)) return [];
        const startIndex = (currentPage[type] - 1) * itemsPerPage;
        return items.slice(startIndex, startIndex + itemsPerPage);
    };

    const convertSolToUsd = (solAmount) => {
        if (!solPrice) return 0;
        return solAmount * solPrice;
    };

    const convertUsdToSol = (usdAmount) => {
        if (!solPrice) return 0;
        return usdAmount / solPrice;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    // Add fallback UI for when data is not available
    if (!userData) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-gray-800/50 rounded-2xl p-8 shadow-xl border border-gray-700/50 backdrop-blur-sm">
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-white mb-4">Profile Data Unavailable</h2>
                            <p className="text-gray-400 mb-6">Unable to load your profile information. This could be due to connectivity issues or your session may have expired.</p>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-3 rounded-xl text-white transition-all duration-300 font-medium shadow-lg hover:shadow-yellow-500/30 text-sm"
                            >
                                Retry Loading Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
            <div className="container mx-auto px-4">
                {/* Profile Header */}
                <div className="max-w-6xl mx-auto rounded-2xl shadow-xl overflow-hidden">
                    {/* Header Banner */}
                    <div className="h-48 relative bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-400">
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
                        <div className="absolute bottom-0 left-0 transform translate-y-1/2 ml-10">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 ring-8 ring-gray-900 flex items-center justify-center">
                                <User size={48} className="text-gray-900" />
                            </div>
                        </div>
                        <div className="absolute bottom-4 right-8">
                            <button
                                onClick={handleDisconnect}
                                className="relative overflow-hidden bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 rounded-xl text-white transition-all duration-300 font-medium shadow-lg hover:shadow-red-500/30 text-sm group"
                            >
                                <span className="absolute inset-0 w-full h-full transition-all duration-300 opacity-0 group-hover:opacity-20 bg-white"></span>
                                <span className="relative flex items-center">
                                    <LogOut size={18} className="mr-2" />
                                    Disconnect
                                </span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Profile Info */}
                    <div className="bg-gray-900 pt-16 pb-8 px-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    {isEditing ? (
                                        <div className="flex items-center">
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-gray-700"
                                                placeholder="Enter username"
                                            />
                                            <button
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="ml-4 bg-gradient-to-r from-green-500 to-green-600 px-6 py-2 rounded-lg text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium disabled:opacity-50 flex items-center space-x-2"
                                            >
                                                {isSaving ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            {username}
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="ml-4 bg-gray-800/80 p-2 rounded-lg text-gray-400 hover:text-white transition-all duration-200"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </h1>
                                <p className="text-yellow-500 font-medium">GAMBLER</p>
                            </div>
                            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                                <div className="bg-gray-800/80 rounded-lg px-4 py-2 border border-gray-700/50">
                                    <span className="text-gray-400 text-sm">User ID</span>
                                    <div className="text-white font-medium">#{userData?.userId || 'N/A'}</div>
                                </div>
                                <div className="bg-gray-800/80 rounded-lg px-4 py-2 border border-gray-700/50">
                                    <span className="text-gray-400 text-sm">Total Wagered</span>
                                    <div className="text-white font-medium">{formatCurrency(userData?.totalWagered || 0)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="border-b border-gray-700/50">
                            <nav className="flex space-x-8">
                                <button 
                                    onClick={() => setActiveTab('overview')}
                                    className={`px-1 py-4 font-medium text-sm relative ${
                                        activeTab === 'overview' 
                                            ? 'text-yellow-500' 
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    Overview
                                    {activeTab === 'overview' && (
                                        <span className="absolute left-0 bottom-0 w-full h-0.5 bg-yellow-500"></span>
                                    )}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('transactions')}
                                    className={`px-1 py-4 font-medium text-sm relative ${
                                        activeTab === 'transactions' 
                                            ? 'text-yellow-500' 
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    Transactions
                                    {activeTab === 'transactions' && (
                                        <span className="absolute left-0 bottom-0 w-full h-0.5 bg-yellow-500"></span>
                                    )}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('lootboxes')}
                                    className={`px-1 py-4 font-medium text-sm relative ${
                                        activeTab === 'lootboxes' 
                                            ? 'text-yellow-500' 
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    Lootboxes
                                    {activeTab === 'lootboxes' && (
                                        <span className="absolute left-0 bottom-0 w-full h-0.5 bg-yellow-500"></span>
                                    )}
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-gray-900 p-8">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {/* Total Deposits */}
                                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-400 font-medium text-sm">Total Deposits</p>
                                                <p className="text-2xl font-bold text-white">{formatCurrency(userData?.totalDeposit || 0)}</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                                <ArrowDownLeft size={20} className="text-green-500" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Withdrawals */}
                                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-400 font-medium text-sm">Total Withdrawals</p>
                                                <p className="text-2xl font-bold text-white">{formatCurrency(userData?.totalWithdraw || 0)}</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                <ArrowUpRight size={20} className="text-blue-500" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profit/Loss */}
                                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-400 font-medium text-sm">Profit/Loss</p>
                                                <p className={`text-2xl font-bold ${calculateProfit() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {formatCurrency(calculateProfit())}
                                                </p>
                                            </div>
                                            <div className={`w-12 h-12 rounded-full ${calculateProfit() >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'} flex items-center justify-center`}>
                                                <DollarSign size={20} className={calculateProfit() >= 0 ? 'text-green-500' : 'text-red-500'} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                        <Clock size={18} className="text-blue-500 mr-2" />
                                        Recent Activity
                                    </h3>
                                    <div className="space-y-4">
                                        {userData?.depositTransactions && userData.depositTransactions.length > 0 && (
                                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mr-4">
                                                        <ArrowDownLeft size={18} className="text-green-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">Deposit</p>
                                                        <p className="text-gray-400 text-sm">{formatDate(depositTransactions[0].transactionDate)}</p>
                                                    </div>
                                                    <div className="ml-auto">
                                                        <p className="text-green-500 font-bold">{formatCurrency(depositTransactions[0].amount)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {userData?.withdrawTransactions && userData.withdrawTransactions.length > 0 && (
                                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-4">
                                                        <ArrowUpRight size={18} className="text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">Withdrawal</p>
                                                        <p className="text-gray-400 text-sm">{formatDate(withdrawTransactions[0].transactionDate)}</p>
                                                    </div>
                                                    <div className="ml-auto">
                                                        <p className="text-blue-500 font-bold">{formatCurrency(withdrawTransactions[0].amount)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {userData?.userLootboxOpeningHistory && userData.userLootboxOpeningHistory.length > 0 && (
                                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mr-4">
                                                        <Gift size={18} className="text-yellow-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">Opened {lootboxHistory[0].lootboxName} Lootbox</p>
                                                        <p className="text-gray-400 text-sm">{formatDate(lootboxHistory[0].timeOpened)}</p>
                                                    </div>
                                                    <div className="ml-auto">
                                                        <p className={`font-bold ${lootboxHistory[0].itemWonValue > lootboxHistory[0].lootboxPrice ? 'text-green-500' : 'text-yellow-500'}`}>
                                                            {formatCurrency(lootboxHistory[0].itemWonValue)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Transactions Tab */}
                        {activeTab === 'transactions' && (
                            <div>
                                {/* Deposits Section */}
                                <div className="mb-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-white flex items-center">
                                            <ArrowDownLeft size={18} className="text-green-500 mr-2" />
                                            Deposits
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <button 
                                                onClick={() => handlePrevPage('deposits')}
                                                disabled={currentPage.deposits === 1}
                                                className="p-1 rounded bg-gray-800 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <span className="text-gray-400 text-sm">
                                                {currentPage.deposits} / {depositPagination}
                                            </span>
                                            <button 
                                                onClick={() => handleNextPage('deposits')}
                                                disabled={currentPage.deposits === depositPagination}
                                                className="p-1 rounded bg-gray-800 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-gray-800/30 rounded-xl overflow-hidden border border-gray-700/50">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gray-800/50 text-left">
                                                        <th className="p-4 text-gray-400 font-medium text-sm">Transaction ID</th>
                                                        <th className="p-4 text-gray-400 font-medium text-sm">Date</th>
                                                        <th className="p-4 text-gray-400 font-medium text-sm text-right">Amount (SOL)</th>
                                                        <th className="p-4 text-gray-400 font-medium text-sm text-right">Amount (USD)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getCurrentItems(depositTransactions, 'deposits').length > 0 ? (
                                                        getCurrentItems(depositTransactions, 'deposits').map((tx) => (
                                                            <tr key={tx.transactionId} className="border-t border-gray-700/50">
                                                                <td className="p-4 text-white">{tx.transactionId}</td>
                                                                <td className="p-4 text-gray-300">{formatDate(tx.transactionDate)}</td>
                                                                <td className="p-4 text-green-500 font-medium text-right">{formatSol(tx.amount)}</td>
                                                                <td className="p-4 text-green-500/80 font-medium text-right">{formatCurrency(convertSolToUsd(tx.amount))}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr className="border-t border-gray-700/50">
                                                            <td colSpan={4} className="p-4 text-gray-400 text-center">No deposit transactions found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Withdrawals Section */}
                                <div className="mb-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-white flex items-center">
                                            <ArrowUpRight size={18} className="text-blue-500 mr-2" />
                                            Withdrawals
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <button 
                                                onClick={() => handlePrevPage('withdrawals')}
                                                disabled={currentPage.withdrawals === 1}
                                                className="p-1 rounded bg-gray-800 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <span className="text-gray-400 text-sm">
                                                {currentPage.withdrawals} / {withdrawPagination}
                                            </span>
                                            <button 
                                                onClick={() => handleNextPage('withdrawals')}
                                                disabled={currentPage.withdrawals === withdrawPagination}
                                                className="p-1 rounded bg-gray-800 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-gray-800/30 rounded-xl overflow-hidden border border-gray-700/50">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gray-800/50 text-left">
                                                        <th className="p-4 text-gray-400 font-medium text-sm">Transaction ID</th>
                                                        <th className="p-4 text-gray-400 font-medium text-sm">Date</th>
                                                        <th className="p-4 text-gray-400 font-medium text-sm">Address</th>
                                                        <th className="p-4 text-gray-400 font-medium text-sm text-right">Amount (SOL)</th>
                                                        <th className="p-4 text-gray-400 font-medium text-sm text-right">Amount (USD)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getCurrentItems(withdrawTransactions, 'withdrawals').length > 0 ? (
                                                        getCurrentItems(withdrawTransactions, 'withdrawals').map((tx) => (
                                                            <tr key={tx.transactionId} className="border-t border-gray-700/50">
                                                                <td className="p-4 text-white">{tx.transactionId}</td>
                                                                <td className="p-4 text-gray-300">{formatDate(tx.transactionDate)}</td>
                                                                <td className="p-4 text-gray-300">
                                                                    <span className="bg-gray-700 rounded px-2 py-1 text-xs font-mono">
                                                                        {truncateAddress(tx.recieverAddress)}
                                                                    </span>
                                                                </td>
                                                                <td className="p-4 text-blue-500 font-medium text-right">{formatSol(convertUsdToSol(tx.amount))}</td>
                                                                <td className="p-4 text-blue-500/80 font-medium text-right">{formatCurrency(tx.amount)}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr className="border-t border-gray-700/50">
                                                            <td colSpan={5} className="p-4 text-gray-400 text-center">No withdrawal transactions found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Lootboxes Tab */}
                        {activeTab === 'lootboxes' && (
                            <div>
                                {/* Lootbox History */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-white flex items-center">
                                            <Gift size={18} className="text-yellow-500 mr-2" />
                                            Lootbox History
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <button 
                                                onClick={() => handlePrevPage('lootboxes')}
                                                disabled={currentPage.lootboxes === 1}
                                                className="p-1 rounded bg-gray-800 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <span className="text-gray-400 text-sm">
                                                {currentPage.lootboxes} / {boxPagination}
                                            </span>
                                            <button 
                                                onClick={() => handleNextPage('lootboxes')}
                                                disabled={currentPage.lootboxes === boxPagination}
                                                className="p-1 rounded bg-gray-800 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-gray-800/30 rounded-xl overflow-hidden border border-gray-700/50">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gray-800/50 text-left">
                                                        <th className="p-4 text-gray-400 font-medium text-sm">Box Name</th>
                                                        <th className="p-4 text-gray-400 font-medium text-sm">Date</th>
                                                        <th className="p-4 text-gray-400 font-medium text-sm">Price</th>
                                                        <th className="p-4 text-gray-400 font-medium text-sm text-right">Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getCurrentItems(lootboxHistory, 'lootboxes').length > 0 ? (
                                                        getCurrentItems(lootboxHistory, 'lootboxes').map((box, index) => (
                                                            <tr key={index} className="border-t border-gray-700/50">
                                                                <td className="p-4">
                                                                    <div className="flex items-center">
                                                                        <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center mr-3">
                                                                            <Gift size={16} className="text-yellow-500" />
                                                                        </div>
                                                                        <span className="text-white capitalize">{box.lootboxName}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="p-4 text-gray-300">{formatDate(box.timeOpened)}</td>
                                                                <td className="p-4 text-gray-300">{formatCurrency(box.lootboxPrice)}</td>
                                                                <td className="p-4 text-right">
                                                                    <div className="flex items-center justify-end">
                                                                        <p className={`font-bold ${box.itemWonValue > box.lootboxPrice ? 'text-green-500' : 'text-yellow-500'}`}>
                                                                            {formatCurrency(box.itemWonValue)}
                                                                        </p>
                                                                        {box.itemWonValue > box.lootboxPrice && (
                                                                            <span className="ml-2 bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full">
                                                                                +{formatCurrency(box.itemWonValue - box.lootboxPrice)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr className="border-t border-gray-700/50">
                                                            <td colSpan={4} className="p-4 text-gray-400 text-center">No lootbox history found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
