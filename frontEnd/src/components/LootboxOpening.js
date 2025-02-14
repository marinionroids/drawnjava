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

  // Updated breakpoints and sizes
  const getItemWidth = () => {
    if (typeof window === 'undefined') return 144;
    if (window.innerWidth < 640) return 96;
    if (window.innerWidth < 768) return 120;
    return 144;
  };

  const getWinPosition = () => {
    if (typeof window === 'undefined') return 47;
    if (window.innerWidth < 640) return 42; // Adjusted for mobile
    if (window.innerWidth < 768) return 44; // Adjusted for tablet
    return 47;
  };

  const ITEM_WIDTH = getItemWidth();
  const WIN_POSITION = getWinPosition();
  const CENTER_POSITION = WIN_POSITION * ITEM_WIDTH;

  // Rest of the state management code remains the same...
  useEffect(() => {
    if (items.length > 0) {
      const initialSequence = Array(60)
          .fill(null)
          .map(() => items[Math.floor(Math.random() * items.length)]);
      setSequence(initialSequence);
    }
  }, [items]);

  // Store the final landing position
  const finalPositionRef = useRef(null);

  useEffect(() => {
    const handleZoomChange = () => {
      if (finalPositionRef.current !== null) {
        setAnimationStyles({
          transform: `translateX(-${finalPositionRef.current}px)`,
          transition: 'none'
        });
      }
    };

    // Only add resize listener if we have a final position
    if (finalPositionRef.current !== null) {
      window.addEventListener('resize', handleZoomChange);
      return () => window.removeEventListener('resize', handleZoomChange);
    }
  }, []);

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

        const response = await fetch(`https://drawngg.com/api/lootbox/open`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': Cookies.get("jwt")
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

        const { success, message, data } = await response.json();
        const { item } = data;

        const newSequence = Array(55)
            .fill(null)
            .map(() => items[Math.floor(Math.random() * items.length)]);

        newSequence[WIN_POSITION] = item;
        setSequence(newSequence);

        await new Promise(resolve => requestAnimationFrame(resolve));

        const containerWidth = containerRef.current?.offsetWidth || 0;
        const containerCenter = containerWidth / 2;

        // Calculate the final position first
        const isMobile = window.innerWidth < 640;
        const isTablet = window.innerWidth >= 640 && window.innerWidth < 768;

        // Start position calculation (further left for longer animation)
        const startOffset = CENTER_POSITION - (ITEM_WIDTH * 25);

        // Calculate where we want to end up
        const currentPosition = CENTER_POSITION - startOffset;
        const itemCenter = currentPosition + (ITEM_WIDTH / 2);

        let adjustment;
        if (isMobile) {
          // Mobile devices: align with left edge of the winning item
          adjustment = containerCenter - itemCenter;
        } else if (isTablet) {
          adjustment = containerCenter - itemCenter + (ITEM_WIDTH * 0.25);
        } else {
          adjustment = containerCenter - itemCenter - (ITEM_WIDTH / 8);
        }

        const initialLandingPosition = startOffset - adjustment + (Math.random() - 0.5) * 2 * 55 ;
        finalPositionRef.current = initialLandingPosition; // Store for resize handling

        // Set initial position without animation
        setAnimationStyles({
          transform: `translateX(-${startOffset}px)`,
          transition: 'none'
        });

        // Start the animation after a brief delay
        setTimeout(() => {
          setAnimationStyles({
            transform: `translateX(-${initialLandingPosition}px)`,
            transition: 'transform 4s cubic-bezier(0.15, 0.45, 0.28, 1)'
          });

          // Set up the second animation for desktop/tablet
          setTimeout(() => {
            setHasLanded(true);

            if (!isMobile) {
              // For desktop/tablet: calculate center position
              const finalCenter = containerCenter - itemCenter - 20;
              const finalPosition = startOffset - finalCenter;
              finalPositionRef.current = finalPosition; // Update final position for resize handling

              setAnimationStyles({
                transform: `translateX(-${finalPosition}px)`,
                transition: 'transform 0.5s ease-out'
              });
            }

            if (onComplete) {
              onComplete(data);
            }
          }, 4000);
        }, 100);

        setTimeout(() => {
          setHasLanded(true);

          // No need for additional movement after initial landing
          setHasLanded(true);
          if (onComplete) {
            onComplete(data);
          }

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
  }, [isOpening, boxName, items, onComplete, onError, ITEM_WIDTH, CENTER_POSITION, WIN_POSITION]);

  return (
      <div
          ref={containerRef}
          className="relative w-full h-32 sm:h-40 md:h-48 overflow-hidden bg-gray-900 rounded-lg"
      >
        <div className="absolute inset-y-0 left-0 w-16 sm:w-20 md:w-24 bg-gradient-to-r from-gray-900 to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-20 md:w-24 bg-gradient-to-l from-gray-900 to-transparent z-10" />

        <div className="absolute left-1/2 top-0 h-full w-0.5 bg-yellow-500 z-20 transform -translate-x-1/2">
          <div className="absolute inset-0 bg-yellow-400 animate-shine" />
        </div>

        <div
            className="flex items-center p-2 sm:p-3 md:p-4"
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
              relative flex-shrink-0 
              w-24 h-24 sm:w-30 sm:h-30 md:w-36 md:h-36 
              border-2 rounded-lg overflow-hidden
              ${hasLanded && index === WIN_POSITION ? getRarityBorder(item.price) : 'border-gray-700'}
              ${hasLanded && index === WIN_POSITION ? 'transition-colors duration-300' : ''}
            `}
              >
                <div className={`absolute inset-0 ${getRarityColor(item.price)}`} />
                <div className="relative z-10 w-full h-full p-1 sm:p-1.5 md:p-2">
                  <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-[90%] h-[90%] object-contain mx-auto my-auto"
                      style={{position: 'absolute', top: '5%', left: '5%'}}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-0.5 sm:p-1 text-center">
                <span className="text-yellow-500 font-semibold text-xs sm:text-sm">
                  ♦ {item.price.toFixed(2)}
                </span>
                  </div>
                </div>
              </div>
          ))}
        </div>
      </div>
  );
};

export default LootboxOpening;