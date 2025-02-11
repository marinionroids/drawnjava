// HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function HomePage() {
  const [boxes, setBoxes] = useState([]);
  const [category, setCategory] = useState('Classic');

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/lootbox');
        setBoxes(response.data);
      } catch (error) {
        console.error('Error fetching boxes:', error);
      }
    };

    fetchBoxes();
  }, []);

  return (
    <main className="max-w-7xl mx-auto mt-0"> {/* Added mt-12 for extra top margin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {[...boxes].sort((a, b) => b.price - a.price).map((box) => (
          <Link
            to={`/lootbox/${box.name.replace(/\s+/g, '').toLowerCase()}`}
            key={box.id}
            className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition cursor-pointer"
          >
            <img
              src={box.imageUrl}
              alt={box.name}
              className="w-full h-32 object-cover rounded-lg"
            />
            <div className="mt-3 text-center">
              <h1 className="text-sm font-bold text-white mb-1">{box.name}</h1>
              <p className="text-yellow-500">
                Open ⚡ {box.price.toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default HomePage;