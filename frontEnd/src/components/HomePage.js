import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function HomePage() {
  const [boxes, setBoxes] = useState([]);
  const [category, setCategory] = useState('Classic');
  console.log('HomePage rendering');

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const response = await axios.get('https://drawngg.com/api/lootbox');
        setBoxes(response.data);
      } catch (error) {
        console.error('Error fetching boxes:', error);
      }
    };

    fetchBoxes();
  }, []);

  return (
      <main className="min-h-screen bg-[#0F1923] px-4 py-20 md:py-24">
        <div className="max-w-7xl mx-auto">
          {/* Grid Container */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
            {[...boxes].sort((a, b) => b.price - a.price).map((box) => (
                <Link
                    to={`/lootbox/${box.name.replace(/\s+/g, '').toLowerCase()}`}
                    key={box.id}
                    className="bg-[#1A2733] rounded-lg p-2 md:p-3 hover:bg-gray-700 transition-colors duration-200 transform hover:scale-105"
                >
                  <div className="relative aspect-square w-full">
                    <img
                        src={box.imageUrl}
                        alt={box.name}
                        className="w-full h-full object-cover rounded-lg"
                        loading="lazy"
                    />
                  </div>
                  <div className="mt-2 md:mt-3 text-center">
                    <h1 className="text-xs md:text-sm font-bold text-white mb-1 truncate px-1">
                      {box.name}
                    </h1>
                    <p className="text-yellow-500 text-xs md:text-sm font-medium">
                      Open ⚡ {box.price.toFixed(2)}
                    </p>
                  </div>
                </Link>
            ))}
          </div>
        </div>
      </main>
  );
}

export default HomePage;