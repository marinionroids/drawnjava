import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import LootboxOpening from './LootboxOpening';
import { useUserBalance } from './UserBalanceContext';
import priceIcon from '../images/priceIcon.png';
import { ArrowLeft, Sparkles, ChevronRight } from 'lucide-react';
import Cookies from 'js-cookie';

function LootboxDetails() {
  const { name } = useParams();
  const { balance, updateBalance, updateBalanceFromServer } = useUserBalance();
  const [boxDetails, setBoxDetails] = useState(null);
  const [items, setItems] = useState([]);
  const [isOpening, setIsOpening] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);

  // Add scroll to top effect
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const generateTransactionId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = Math.floor(Math.random() * 3) + 10; // Random length between 10-12
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const getRarityColor = (value) => {
    if (value >= 1000) return 'bg-gradient-to-b from-orange-500/20 to-orange-900/20';
    if (value >= 500) return 'bg-gradient-to-b from-purple-500/20 to-purple-900/20';
    return 'bg-gradient-to-b from-blue-500/20 to-blue-900/20';
  };

  const getRarityBorder = (value) => {
    if (value >= 1000) return 'border-orange-500/50';
    if (value >= 500) return 'border-purple-500/50';
    return 'border-blue-500/50';
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(`https://drawngg.com/api/lootbox/${name}`);
        setBoxDetails(response.data);
        const itemsResponse = await axios.get(`https://drawngg.com/api/lootbox/${name}/items`);
        setItems(itemsResponse.data);
      } catch (error) {
        console.error('Error fetching box details:', error);
      }
    };

    fetchDetails();
  }, [name]);

  const handleOpenBox = async () => {
    try {
      setIsOpening(true);
      
      // Make the server request
      const response = await fetch(`https://drawngg.com/api/lootbox/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': Cookies.get("jwt")
        },
        body: JSON.stringify({
          transactionId: generateTransactionId(),
          lootboxName: name,
          recievingWalletAddress: Cookies.get("recievingAddress"),
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { success, message, data } = await response.json();
      
      // Update local balance after successful server confirmation
      const newBalance = balance - boxDetails.price;
      updateBalance(newBalance);
      
      // Store the server response for the animation component
      setServerResponse(data);
    } catch (error) {
      console.error('Error opening box:', error);
      setIsOpening(false);
    }
  };

  const handleOpeningComplete = async () => {
    setIsOpening(false);
    setServerResponse(null);
    await updateBalanceFromServer();
  };

  const handleError = (error) => {
    console.error('Error opening box:', error);
    setIsOpening(false);
  };

  if (!boxDetails) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="flex items-center space-x-3">
        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 text-sm bg-gray-800/50 hover:bg-gray-700/50 rounded-xl mb-8 mt-6 transition-colors group"
        >
          <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Lootboxes
        </Link>

        {/* Box Details Header */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative">
            <div 
              className="w-40 sm:w-56 aspect-square relative group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className={`absolute inset-0 bg-gradient-to-b from-yellow-500/30 to-transparent rounded-2xl transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-50'}`}></div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl opacity-30 blur-xl transition-opacity duration-500"></div>
              <img
                src={boxDetails.imageUrl}
                alt={boxDetails.name}
                className="w-full h-full object-contain relative z-10 rounded-2xl transition-transform duration-500 transform group-hover:scale-105"
              />
              <Sparkles className="absolute top-2 right-2 text-yellow-500/80 w-6 h-6 animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mt-6 text-center bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
            {boxDetails.name}
          </h1>
        </div>

        {/* Lootbox Opening Section */}
        <div className="mb-8">
          <LootboxOpening
            boxName={name}
            items={items}
            isOpening={isOpening}
            onComplete={handleOpeningComplete}
            onError={handleError}
            getRarityColor={getRarityColor}
            getRarityBorder={getRarityBorder}
            serverResponse={serverResponse}
          />
        </div>

        {/* Open Button */}
        <div className="flex justify-center mb-12">
          <button
            onClick={handleOpenBox}
            disabled={isOpening || balance < boxDetails.price}
            className={`
              relative overflow-hidden
              bg-gradient-to-r from-red-500 to-blue-600
              px-8 py-4 rounded-xl transition-all duration-300
              transform hover:scale-105 active:scale-95 disabled:scale-100
              shadow-lg shadow-green-500/20 text-lg sm:text-xl font-bold
              disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed
              w-full sm:w-auto sm:min-w-[250px] group
            `}
          >
            <div className="absolute inset-0 w-full h-full transition-all duration-300">
              <div className="absolute inset-0 opacity-75 filter blur-xl bg-gradient-to-r from-yellow-500 to-orange-500"></div>
            </div>
            <span className="relative z-10 flex items-center justify-center text-gray-900">
              Open for <img src={priceIcon} alt="Price Icon" className="w-5 h-5 mx-2" /> {boxDetails.price.toFixed(2)}
            </span>
          </button>
        </div>

        {/* Potential Drops Section */}
        <div className="bg-gray-800/50 rounded-2xl p-6 sm:p-8 backdrop-blur-sm border border-gray-700/50">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-yellow-500" />
            Potential Drops
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className={`
                  relative bg-gray-900/50 rounded-xl overflow-hidden 
                  border border-gray-800 hover:border-gray-700 
                  transition-all duration-300 hover:scale-105 group
                `}
              >
                <div className={`absolute inset-0 ${getRarityColor(item.price)} opacity-10 group-hover:opacity-20 transition-opacity`}/>
                <div className="relative z-10">
                  {/* Drop Rate Badge */}
                  <div className="absolute top-2 left-2 z-20">
                    <div className="inline-block bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <p className="text-yellow-500 text-xs font-medium">{item.dropRate}%</p>
                    </div>
                  </div>

                  {/* Image Container with Price Overlay */}
                  <div className="relative bg-black/30 w-full aspect-square p-2">
                    {/* Price Overlay */}
                    <div className="absolute bottom-2 inset-x-0 z-20 flex justify-center">
                      <div className="inline-block bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg">
                        <p className="text-yellow-500 font-bold text-sm flex items-center">
                          <img src={priceIcon} alt="Price Icon" className="w-4 h-4 mr-1" />
                          {item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>

                  {/* Name */}
                  <div className="text-center py-2 px-2 bg-black/30">
                    <p className="text-gray-300 text-sm font-medium truncate">{item.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LootboxDetails;