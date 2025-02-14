import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import LootboxOpening from './LootboxOpening';
import { useUserBalance } from './UserBalanceContext';

function LootboxDetails() {
  const { name } = useParams();
  const { balance, updateBalance, updateBalanceFromServer } = useUserBalance();
  const [boxDetails, setBoxDetails] = useState(null);
  const [items, setItems] = useState([]);
  const [isOpening, setIsOpening] = useState(false);

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

  const handleOpenBox = () => {
    setIsOpening(true);
    // Immediately update balance locally
    const newBalance = balance - boxDetails.price;
    updateBalance(newBalance);
  };

  const handleOpeningComplete = async () => {
    setIsOpening(false);
    // After animation completes, sync with server
    await updateBalanceFromServer();
  };

  const handleError = (error) => {
    console.error('Error opening box:', error);
    setIsOpening(false);
  };
  console.log(boxDetails);
  if (!boxDetails) return <div>Loading...</div>;

  return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto p-6">
          <Link
              to="/"
              className="inline-flex items-center px-5 py-3 text-sm bg-gray-800 hover:bg-gray-700 rounded-md mb-6"
          >
            Back
          </Link>

          <div className="flex flex-col items-center mb-8">
            <div className="w-48 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/20 to-transparent rounded-xl"></div>
              <img
                  src={boxDetails.imageUrl}
                  alt={boxDetails.name}
                  className="w-full rounded-xl shadow-lg shadow-yellow-500/10"
              />
            </div>
            <h1 className="text-2xl font-bold mt-4 text-center">{boxDetails.name}</h1>
          </div>

          <div className="mb-4">
            <LootboxOpening
                boxName={name}
                items={items}
                isOpening={isOpening}
                onComplete={handleOpeningComplete}
                onError={handleError}
                getRarityColor={getRarityColor}
                getRarityBorder={getRarityBorder}
            />
          </div>

          <div className="flex justify-center mb-8">
            <button
                onClick={handleOpenBox}
                disabled={isOpening || balance < boxDetails.price}
                className={`
          relative overflow-hidden
          bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-800 
          px-4 py-2 rounded-md transition-colors
          transform hover:scale-105 active:scale-95
          shadow-lg shadow-yellow-500/20 text-lg text-[rgb(33,37,41)]
        `}
            >
              <div
                  className="absolute inset-0 w-[350%] h-full animate-spin"
                  style={{
                    background: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 12px,
              rgba(20, 22, 26, 0.1) 0px,
              rgba(20, 22, 26, 0.1) 24px
            )`,
                    left: '0'
                  }}
              />
              <span className="relative z-10">
          Open for ♦ {boxDetails.price.toFixed(2)}
        </span>
            </button>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4">Potential Drops</h2>
            <div className="grid grid-cols-5 gap-6">
              {items.map((item) => (
                  <div
                      key={item.id}
                      className={`relative bg-black rounded-md overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors`}
                  >
                    <div className={`absolute inset-0 ${getRarityColor(item.price)} opacity-10`}/>
                    <div className="relative z-10">
                      {/* Drop Rate Badge */}
                      <div className="absolute top-2 left-2 z-20">
                        <div className="inline-block bg-black/80 px-2 py-0.5 rounded">
                          <p className="text-yellow-500 text-[15px]">{item.dropRate}%</p>
                        </div>
                      </div>

                      {/* Image Container with Price Overlay */}
                      <div className="relative bg-black/50 w-full aspect-square">
                        {/* Price Overlay */}
                        <div className="absolute bottom-2 inset-x-0 z-20 flex justify-center">
                          <div className="inline-block bg-black/80 px-2 py-0.5 rounded">
                            <p className="text-yellow-500 font-bold text-[15px]">♦ {item.price.toFixed(2)}</p>
                          </div>
                        </div>

                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-contain p-2"
                        />
                      </div>

                      {/* Name */}
                      <div className="text-center py-1 px-1">
                        <p className="text-gray-300 text-sm truncate">{item.name}</p>
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