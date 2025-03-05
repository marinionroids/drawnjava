import React, { useState, useEffect, useRef } from 'react';

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
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const animationInProgressRef = useRef(false);
  const finalPositionRef = useRef(null);

  // Updated breakpoints and sizes with memoization
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

  // Initialize sequence once when items are loaded
  useEffect(() => {
    if (items.length > 0) {
      const initialSequence = Array(60)
        .fill(null)
        .map(() => items[Math.floor(Math.random() * items.length)]);
      setSequence(initialSequence);
    }
  }, [items]);

  // Handle window resize and zoom for consistent positioning
  useEffect(() => {
    const handleZoomOrResize = () => {
      if (hasLanded && containerRef.current) {
        // Calculate the exact position to center the winning item
        const containerWidth = containerRef.current.offsetWidth;
        const containerCenter = containerWidth / 2;
        
        // Calculate the position that centers the winning item
        const itemWidth = getItemWidth();
        const winnerCenterPosition = itemWidth * WIN_POSITION + (itemWidth / 2);
        
        // Calculate the exact offset needed to center the winner
        const exactOffset = winnerCenterPosition - containerCenter;
        
        // Immediately snap to the winning position without animation
        setAnimationStyles({
          transform: `translateX(-${exactOffset}px)`,
          transition: 'none'
        });
        
        // Update final position reference
        finalPositionRef.current = exactOffset;
      }
    };

    // Handle both resize and zoom events
    window.addEventListener('resize', handleZoomOrResize);
    
    // Some browsers trigger different events for zoom
    if ('onwheel' in document) {
      // Modern browsers support wheel event with ctrl key for zoom
      window.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
          // This is likely a zoom operation
          setTimeout(handleZoomOrResize, 100); // Small delay to let zoom complete
        }
      });
    }
    
    return () => {
      window.removeEventListener('resize', handleZoomOrResize);
      if ('onwheel' in document) {
        window.removeEventListener('wheel', handleZoomOrResize);
      }
    };
  }, [hasLanded, WIN_POSITION]);

  // Main animation effect
  useEffect(() => {
    if (!isOpening || !serverResponse || items.length === 0) {
      setHasLanded(false);
      return;
    }

    const startAnimation = async () => {
      try {
        // Prevent multiple animations from running simultaneously
        if (animationInProgressRef.current) return;
        animationInProgressRef.current = true;
        
        // Reset the animation state
        setHasLanded(false);
        setAnimationStyles({
          transform: 'translateX(0)',
          transition: 'none'
        });

        // Wait for next frame to ensure initial position is set
        await new Promise(resolve => {
          animationFrameRef.current = requestAnimationFrame(() => {
            requestAnimationFrame(resolve); // Double RAF for better sync
          });
        });

        const { item } = serverResponse;

        // Create a new sequence with winning item at the right position
        const newSequence = Array(60)
          .fill(null)
          .map(() => items[Math.floor(Math.random() * items.length)]);

        // Ensure winning item is placed at the winning position
        newSequence[WIN_POSITION] = item;
        setSequence(newSequence);

        // Wait for sequence update to be applied
        await new Promise(resolve => {
          animationFrameRef.current = requestAnimationFrame(() => {
            requestAnimationFrame(resolve); // Double RAF for better sync
          });
        });

        // Calculate the container center precisely
        const containerWidth = containerRef.current?.offsetWidth || 0;
        const containerCenter = containerWidth / 2;

        // Calculate device-specific adjustments
        const isMobile = window.innerWidth < 640;
        const isTablet = window.innerWidth >= 640 && window.innerWidth < 768;

        // Starting offset calculations
        const startOffset = CENTER_POSITION - (ITEM_WIDTH * 25);
        const currentPosition = CENTER_POSITION - startOffset;
        const itemCenter = currentPosition + (ITEM_WIDTH / 2);

        // Calculate device-specific alignment adjustments
        let adjustment;
        if (isMobile) {
          adjustment = containerCenter - itemCenter;
        } else if (isTablet) {
          adjustment = containerCenter - itemCenter + (ITEM_WIDTH * 0.25);
        } else {
          adjustment = containerCenter - itemCenter - (ITEM_WIDTH / 8);
        }

        // Apply a small random offset for natural feel, but keep it small to prevent extreme movement
        const randomOffset = (Math.random() - 0.5) * 2 * 55; // Reduced from 55 to 15 for stability
        const initialLandingPosition = startOffset - adjustment + randomOffset;
        
        // Store for resize handling
        finalPositionRef.current = initialLandingPosition;

        // Set initial position without animation first
        setAnimationStyles({
          transform: `translateX(-${startOffset}px)`,
          transition: 'none'
        });

        // Wait for position update to be applied
        await new Promise(resolve => {
          animationFrameRef.current = requestAnimationFrame(() => {
            requestAnimationFrame(resolve); // Double RAF for better sync
          });
        });

        // Start the main animation with a consistent cubic-bezier curve
        setAnimationStyles({
          transform: `translateX(-${initialLandingPosition}px)`,
          transition: 'transform 4s cubic-bezier(0.15, 0.45, 0.28, 1)'
        });

        // Set up the final animation with timeout
        setTimeout(() => {
          setHasLanded(true);

          if (!isMobile) {
            // Final adjustments for desktop
            const finalCenter = containerCenter - itemCenter - 20;
            const finalPosition = startOffset - finalCenter;
            finalPositionRef.current = finalPosition;

            setAnimationStyles({
              transform: `translateX(-${finalPosition}px)`,
              transition: 'transform 0.5s ease-out'
            });
            
            // After the final landing, calculate the exact center position
            // This will be used for any zoom/resize events later
            setTimeout(() => {
              // Recalculate exact winner position for future zoom events
              if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const containerCenter = containerWidth / 2;
                const winnerCenterPosition = ITEM_WIDTH * WIN_POSITION + (ITEM_WIDTH / 2);
                const exactOffset = winnerCenterPosition - containerCenter;
                finalPositionRef.current = exactOffset;
              }
            }, 550);
          }

          // Signal animation completion after all transitions
          setTimeout(() => {
            animationInProgressRef.current = false;
            if (onComplete) {
              onComplete(serverResponse);
            }
          }, 600); // Wait for final transition (0.5s) plus a little extra
        }, 4100); // 4s for main animation + 100ms buffer

      } catch (error) {
        console.error('Error in animation sequence:', error);
        animationInProgressRef.current = false;
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
      {/* Gradient overlays for sides */}
      <div className="absolute inset-y-0 left-0 w-16 sm:w-20 md:w-24 bg-gradient-to-r from-gray-900 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-16 sm:w-20 md:w-24 bg-gradient-to-l from-gray-900 to-transparent z-10" />

      {/* Center indicator */}
      <div className="absolute left-1/2 top-0 h-full w-0.5 bg-yellow-500 z-20 transform -translate-x-1/2">
        <div className="absolute inset-0 bg-yellow-400 animate-shine" />
      </div>

      {/* Items container with animation */}
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
            key={`${item?.id || 'placeholder'}-${index}`}
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