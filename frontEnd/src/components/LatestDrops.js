import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy } from 'lucide-react';
import priceIcon from '../images/priceIcon.png';

const LatestDrops = () => {
  const [drops, setDrops] = useState([]);
  
  useEffect(() => {
    const fetchDrops = async () => {
      try {
        const response = await axios.get('https://drawngg.com/api/latestdrops');
        // Access the nested data array in the response
        if (response.data && response.data.success && response.data.data) {
          setDrops(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching latest drops:', error);
      }
    };
    
    // Initial fetch
    fetchDrops();
    
    // Set up polling every 5 seconds
    const interval = setInterval(fetchDrops, 5000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed right-4 top-24 bottom-4 w-72 bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-xl overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-gray-700/50">
        <div className="flex items-center">
          <Trophy className="text-yellow-500 mr-2" size={20} />
          <h3 className="text-white font-bold">Latest Wins</h3>
        </div>
      </div>
      
      <div className="h-full overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-gray-800/90 to-transparent z-10"></div>
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-gray-800/90 to-transparent z-10"></div>
        
        <div className="p-3 space-y-3">
          {drops.map((drop, index) => (
            <div
              key={index}
              className="relative group bg-gray-900/50 rounded-lg p-3 border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300"
            >
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={drop.itemUrl} // Changed from itemImage to itemUrl
                    alt={drop.itemName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-green-400 text-sm font-medium truncate">
                    {drop.username}
                  </p>
                  <p className="text-yellow-500 text-sm font-semibold truncate">
                    {drop.itemName}
                  </p>
                  <div className="flex items-center mt-1">
                    <img src={priceIcon} alt="Price" className="w-3 h-3 mr-1" />
                    <span className="text-yellow-500 text-xs">
                      {drop.value.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LatestDrops;