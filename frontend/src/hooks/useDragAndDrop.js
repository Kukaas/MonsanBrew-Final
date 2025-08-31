import { useState, useEffect } from 'react';

export const useDragAndDrop = (onDrop, isAnimating = false) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  const handleTouchStart = (e) => {
    if (isAnimating) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || isAnimating) return;
    e.preventDefault();
    const touch = e.touches[0];
    setDragPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e) => {
    if (!isDragging || isAnimating) return;
    setIsDragging(false);

    const drinkArea = document.querySelector('.drink-display-area');
    if (drinkArea) {
      const rect = drinkArea.getBoundingClientRect();
      const touch = e.changedTouches[0];

      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      ) {
        onDrop();
      }
    }
  };

  const handleMouseDown = (e) => {
    if (isAnimating) return;
    setIsDragging(true);
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || isAnimating) return;
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e) => {
    if (!isDragging || isAnimating) return;
    setIsDragging(false);

    const drinkArea = document.querySelector('.drink-display-area');
    if (drinkArea) {
      const rect = drinkArea.getBoundingClientRect();

      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        onDrop();
      }
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, isAnimating, onDrop]);

  return {
    isDragging,
    dragPosition,
    handleMouseDown,
    handleTouchStart
  };
};
