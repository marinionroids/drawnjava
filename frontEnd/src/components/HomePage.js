import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import priceIcon from '../images/priceIcon.png';
import { TrendingUp, Star, Sparkles } from 'lucide-react';
import LatestDrops from './LatestDrops';

function HomePage() {
  const [boxes, setBoxes] = useState([]);
  const [category, setCategory] = useState('All');
  const [featuredBox, setFeaturedBox] = useState(null);

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const response = await axios.get('https://drawngg.com/api/lootbox');
        setBoxes(response.data);
        // Set the most expensive box as featured
        const sortedBoxes = [...response.data].sort((a, b) => b.price - a.price);
        setFeaturedBox(sortedBoxes[85]);
      } catch (error) {
        console.error('Error fetching boxes:', error);
      }
    };

    fetchBoxes();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 px-4 py-20 md:py-24">
      <div className="pr-80">
        {/* Featured Box Section */}
        {featuredBox && (
          <div className="max-w-7xl mx-auto mb-12">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,...')] opacity-5"></div>
              <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center">
                <div className="w-48 md:w-64 mb-6 md:mb-0 md:mr-8">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                    <img
                      src={featuredBox.imageUrl}
                      alt={featuredBox.name}
                      className="relative rounded-lg w-full transform transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start mb-2">
                    <Star className="text-yellow-500 mr-2" size={20} />
                    <h2 className="text-yellow-500 text-sm font-semibold uppercase tracking-wider">Featured Box</h2>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">{featuredBox.name}</h3>
                  <p className="text-gray-300 mb-6 max-w-2xl">Experience the thrill of our premium lootbox with the highest value items and best odds!</p>
                  <Link
                    to={`/lootbox/${featuredBox.name.replace(/\s+/g, '').toLowerCase()}`}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-semibold text-gray-900 transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25"
                  >
                    <Sparkles className="mr-2" size={20} />
                    Open Box <img src={priceIcon} alt="Price" className="w-4 h-4 mx-2" /> {featuredBox.price.toFixed(2)}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid Section */}
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <TrendingUp className="text-yellow-500 mr-2" size={24} />
              Popular Boxes
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {[...boxes].sort((a, b) => b.price - a.price).map((box) => (
              <Link
                to={`/lootbox/${box.name.replace(/\s+/g, '').toLowerCase()}`}
                key={box.id}
                className="group relative bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-105 border border-gray-700/50 hover:border-yellow-500/50"
              >
                <div className="relative aspect-square w-full mb-3 overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img
                    src={box.imageUrl}
                    alt={box.name}
                    className="w-full h-full object-cover rounded-lg transform transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-bold text-white mb-2 truncate px-1">
                    {box.name}
                  </h3>
                  <p className="text-yellow-500 text-sm font-medium flex items-center justify-center bg-gray-900/50 rounded-full py-1 px-3">
                    Open <img src={priceIcon} alt="Price Icon" className="w-3 h-3 mx-1" /> {box.price.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Drops Sidebar */}
      <LatestDrops />
    </main>
  );
}

export default HomePage;