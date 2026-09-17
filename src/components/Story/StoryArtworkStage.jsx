import React, { useState, useEffect } from 'react';

/**
 * useCoverRect
 * Computes the exact pixel dimensions and offsets of the 1536x1024 (aspect ratio 1.5)
 * storybook illustration as rendered by `object-fit: cover` within the window.
 */
export function useCoverRect(aspectRatio = 1.5) {
  const [rect, setRect] = useState(() => {
    if (typeof window === 'undefined') return { left: 0, top: 0, width: 0, height: 0 };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const screenAspect = vw / vh;
    if (screenAspect > aspectRatio) {
      const width = vw;
      const height = vw / aspectRatio;
      return { left: 0, top: (vh - height) / 2, width, height };
    } else {
      const height = vh;
      const width = vh * aspectRatio;
      return { left: (vw - width) / 2, top: 0, width, height };
    }
  });

  useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const screenAspect = vw / vh;
      let width, height, left, top;

      if (screenAspect > aspectRatio) {
        width = vw;
        height = vw / aspectRatio;
        left = 0;
        top = (vh - height) / 2;
      } else {
        height = vh;
        width = vh * aspectRatio;
        left = (vw - width) / 2;
        top = 0;
      }

      setRect({ left, top, width, height });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [aspectRatio]);

  return rect;
}

/**
 * StoryArtworkStage
 * An exact coordinate container positioned directly over the visible 1536x1024 artwork.
 * Any percentage inside this container (e.g. left: 75%, top: 50%) will always stay
 * locked to the exact pixel of the illustration on any screen resolution or aspect ratio.
 */
export default function StoryArtworkStage({ children, className = '' }) {
  const rect = useCoverRect(1.5);

  return (
    <div
      className={`story-artwork-stage ${className}`}
      style={{
        position: 'absolute',
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 15
      }}
    >
      {children}
    </div>
  );
}
