import React, { useState, useEffect, useRef } from 'react';
import Cookies from "js-cookie";

const LootboxOpening = ({
                          boxName,
                          items,
                          isOpening,
                          onComplete,
                          onError,
                          getRarityColor,
                          getRarityBorder,
                          serverResponse
                        }) => {
  const [sequence, setSequence] = useState([]);
  const [animationStyles, setAnimationStyles] = useState({
    transform: 'translateX(0)'
  });
  const [hasLanded, setHasLanded] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(null);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Updated breakpoints and sizes
  const getItemWidth = () => {
    if (typeof window === 'undefined') return 144;
    if (window.innerWidth < 640) return 96;
    if (window.innerWidth < 768) return 120;
    return 144;
  };

  const getWinPosition = () => {
    if (typeof window === 'undefined') return 47;
    if (window.innerWidth < 640) return 42;
    if (window.innerWidth < 768) return 44;
    return 47;
  };

  const ITEM_WIDTH = getItemWidth();
  const WIN_POSITION = getWinPosition();
  const CENTER_POSITION = WIN_POSITION * ITEM_WIDTH;

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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

    if (finalPositionRef.current !== null) {
      window.addEventListener('resize', handleZoomChange);
      return () => window.removeEventListener('resize', handleZoomChange);
    }
  }, []);

  useEffect(() => {
    if (!isOpening || !serverResponse) {
      setHasLanded(false);
      setCurrentOffset(null);
      return;
    }

    const startAnimation = async () => {
      try {
        setHasLanded(false);
        setAnimationStyles({
          transform: 'translateX(0)',
          transition: 'none'
        });

        // Wait for next frame to ensure initial position is set
        await new Promise(resolve => {
          animationFrameRef.current = requestAnimationFrame(resolve);
        });

        const { item } = serverResponse;

        const newSequence = Array(55)
            .fill(null)
            .map(() => items[Math.floor(Math.random() * items.length)]);

        newSequence[WIN_POSITION] = item;
        setSequence(newSequence);

        // Wait for sequence update
        await new Promise(resolve => {
          animationFrameRef.current = requestAnimationFrame(resolve);
        });

        const containerWidth = containerRef.current?.offsetWidth || 0;
        const containerCenter = containerWidth / 2;

        const isMobile = window.innerWidth < 640;
        const isTablet = window.innerWidth >= 640 && window.innerWidth < 768;

        const startOffset = CENTER_POSITION - (ITEM_WIDTH * 25);
        const currentPosition = CENTER_POSITION - startOffset;
        const itemCenter = currentPosition + (ITEM_WIDTH / 2);

        let adjustment;
        if (isMobile) {
          adjustment = containerCenter - itemCenter;
        } else if (isTablet) {
          adjustment = containerCenter - itemCenter + (ITEM_WIDTH * 0.25);
        } else {
          adjustment = containerCenter - itemCenter - (ITEM_WIDTH / 8);
        }

        const initialLandingPosition = startOffset - adjustment + (Math.random() - 0.5) * 2 * 55;
        finalPositionRef.current = initialLandingPosition;

        // Set initial position without animation
        setAnimationStyles({
          transform: `translateX(-${startOffset}px)`,
          transition: 'none'
        });

        // Wait for position update
        await new Promise(resolve => {
          animationFrameRef.current = requestAnimationFrame(resolve);
        });

        // Start the main animation
        setAnimationStyles({
          transform: `translateX(-${initialLandingPosition}px)`,
          transition: 'transform 4s cubic-bezier(0.15, 0.45, 0.28, 1)'
        });

        // Set up the final animation
        setTimeout(() => {
          setHasLanded(true);

          if (!isMobile) {
            const finalCenter = containerCenter - itemCenter - 20;
            const finalPosition = startOffset - finalCenter;
            finalPositionRef.current = finalPosition;

            setAnimationStyles({
              transform: `translateX(-${finalPosition}px)`,
              transition: 'transform 0.5s ease-out'
            });
          }

          // Call onComplete after all animations
          if (onComplete) {
            onComplete(serverResponse);
          }
        }, 4000);

      } catch (error) {
        console.error('Error in animation sequence:', error);
        if (onError) {
          onError(error);
        }
      }
    };

    startAnimation();
  }, [isOpening, serverResponse, items, onComplete, onError, ITEM_WIDTH, CENTER_POSITION, WIN_POSITION]);

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