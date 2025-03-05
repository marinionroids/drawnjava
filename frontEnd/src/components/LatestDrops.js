import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, X, Gift } from 'lucide-react';
import priceIcon from '../images/priceIcon.png';
import { Link } from 'react-router-dom';

const LatestDrops = ({ onClose }) => {
  const [drops, setDrops] = useState([]);
  const [selectedDrop, setSelectedDrop] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchDrops = async () => {
      try {
        const response = await axios.get('https://drawngg.com/api/latestdrops');
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
    <div className="w-full md:w-72 h-full bg-gray-800/90 backdrop-blur-sm border-l mt-5 border-gray-700/50 shadow-xl md:mr-4 md:rounded-lg md:border md:border-gray-700/50 md:shadow-2xl md:shadow-black/20">
      <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-gray-700/50 flex items-center justify-between md:rounded-t-lg">
        <div className="flex items-center">
          <Trophy className="text-yellow-500 mr-2" size={20} />
          <h3 className="text-white font-bold">Latest Wins</h3>
        </div>
        <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
          <X size={20} />
        </button>
      </div>
      
      <div className="h-[calc(100%-4rem)] md:rounded-b-lg">
        <div className="h-full space-y-2 p-4">
          {drops.map((drop, index) => (
            <Link 
              key={index}
              to={`/lootbox/${drop.lootbox.name.replace(/\s+/g, '').toLowerCase()}`}
              className="block"
            >
              <div
                className="relative group bg-gray-900/50 rounded-lg p-3 border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/5"
                onClick={() => isMobile && setSelectedDrop(selectedDrop === drop ? null : drop)}
              >
                {/* Item Info - Hidden on hover */}
                <div className="md:group-hover:hidden">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={drop.itemUrl}
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
                </div>

                {/* Lootbox Info - Shown on hover */}
                <div className="hidden md:group-hover:block">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={drop.lootbox.imageUrl}
                        alt={drop.lootbox.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-green-400 text-sm font-medium truncate">
                        {drop.lootbox.name}
                      </p>
                      <p className="text-yellow-500 text-sm font-semibold truncate">
                        Lootbox
                      </p>
                      <div className="flex items-center mt-1">
                        <img src={priceIcon} alt="Price" className="w-3 h-3 mr-1" />
                        <span className="text-yellow-500 text-xs">
                          {drop.lootbox.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Expanded Info */}
                {isMobile && selectedDrop === drop && (
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={drop.lootbox.imageUrl}
                          alt={drop.lootbox.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-green-400 text-sm font-medium truncate">
                          {drop.lootbox.name}
                        </p>
                        <p className="text-yellow-500 text-sm font-semibold truncate">
                          Lootbox
                        </p>
                        <div className="flex items-center mt-1">
                          <img src={priceIcon} alt="Price" className="w-3 h-3 mr-1" />
                          <span className="text-yellow-500 text-xs">
                            {drop.lootbox.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LatestDrops;