import React, { useState, useEffect, useRef } from 'react';
import Cookies from "js-cookie";

const LootboxOpening = ({
  boxName,
  items,
  isOpening,
  onComplete,
  onError,
  getRarityColor,
  getRarityBorder
}) => {
  const [sequence, setSequence] = useState([]);
  const [animationStyles, setAnimationStyles] = useState({
    transform: 'translateX(0)'
  });
  const [hasLanded, setHasLanded] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(null);
  const containerRef = useRef(null);
  const WIN_POSITION = 47;
  const ITEM_WIDTH = 144;
  const CENTER_POSITION = WIN_POSITION * ITEM_WIDTH;

  useEffect(() => {
    if (items.length > 0) {
      const initialSequence = Array(50)
        .fill(null)
        .map(() => items[Math.floor(Math.random() * items.length)]);
      setSequence(initialSequence);
    }
  }, [items]);

  useEffect(() => {
    const handleZoomChange = () => {
      if (currentOffset !== null) {
        setAnimationStyles({
          transform: `translateX(-${currentOffset}px)`,
          transition: 'none'
        });
        setHasLanded(true);
        if (onComplete) {
          onComplete();
        }
      }
    };

    window.addEventListener('resize', handleZoomChange);
    return () => window.removeEventListener('resize', handleZoomChange);
  }, [currentOffset, onComplete]);

  useEffect(() => {
    if (!isOpening) {
      setHasLanded(false);
      setCurrentOffset(null);
      return;
    }

    const openBox = async () => {
      try {
        setHasLanded(false);
        setAnimationStyles({
          transform: 'translateX(0)',
          transition: 'none'
        });

        await new Promise(resolve => setTimeout(resolve, 50));

        const response = await fetch(`http://drawngg.com/api/lootbox/open`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': Cookies.get("jwt")  // FastAPI expects exact header name match
              },

          body: JSON.stringify({
            transactionId: "randomnow",
            lootboxName: boxName,
            recievingWalletAddress: Cookies.get("recievingAddress"),
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { success, message , data} = await response.json();

        const { item } = data;

        console.log('Server selected:', item.name);

        const newSequence = Array(55)
          .fill(null)
          .map(() => items[Math.floor(Math.random() * items.length)]);

        newSequence[WIN_POSITION] = item;
        setSequence(newSequence);

        await new Promise(resolve => requestAnimationFrame(resolve));

        const initialOffset = CENTER_POSITION - (ITEM_WIDTH * 2) - 144;
        setCurrentOffset(initialOffset);

        setAnimationStyles({
          transform: `translateX(-${initialOffset}px)`,
          transition: 'transform 5s cubic-bezier(0.21, 0.53, 0.29, 1)'
        });

        setTimeout(() => {
          setHasLanded(true);

          const containerWidth = containerRef.current?.offsetWidth || 0;
          const containerCenter = containerWidth / 2;
          const currentPosition = CENTER_POSITION - initialOffset;
          const itemCenter = currentPosition + (ITEM_WIDTH / 2);
          const adjustment = containerCenter - itemCenter - 17;

          setAnimationStyles({
            transform: `translateX(-${initialOffset - adjustment}px)`,
            transition: 'transform 0.5s ease-out'
          });

          if (onComplete) {
            onComplete(data);
          }
        }, 5000);

      } catch (error) {
        console.error('Error opening lootbox:', error);
        if (onError) {
          onError(error);
        }
      }
    };

    openBox();
  }, [isOpening, boxName, items, onComplete, onError]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-48 overflow-hidden bg-gray-900 rounded-lg"
    >
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-900 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-900 to-transparent z-10" />

      <div className="absolute left-1/2 top-0 h-full w-0.5 bg-yellow-500 z-20 transform -translate-x-1/2">
        <div className="absolute inset-0 bg-yellow-400 animate-shine" />
      </div>

      <div
        className="flex items-center p-4"
        style={{
          ...animationStyles,
          marginLeft: '0',
          paddingRight: '0',
          willChange: 'transform'
        }}
      >
        {sequence.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className={`
              relative flex-shrink-0 w-36 h-36 border-2 rounded-lg overflow-hidden
              ${hasLanded && index === WIN_POSITION ? getRarityBorder(item.price) : 'border-gray-700'}
              ${hasLanded && index === WIN_POSITION ? 'transition-colors duration-300' : ''}
            `}
          >
            <div className={`absolute inset-0 ${getRarityColor(item.price)}`} />
            <div className="relative z-10 w-full h-full p-2">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-[90%] h-[90%] object-contain mx-auto my-auto"
                style={{position: 'absolute', top: '5%', left: '5%'}}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1 text-center">
                <span className="text-yellow-500 font-semibold text-sm">♦ {item.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LootboxOpening;