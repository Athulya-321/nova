import React from 'react';
import Chapter1Atmosphere from './Chapter1Atmosphere';
import Chapter2Atmosphere from './Chapter2Atmosphere';
import Chapter6Atmosphere from './Chapter6Atmosphere';
import Chapter7Atmosphere from './Chapter7Atmosphere';
import AtmosphericStoryLayer from './AtmosphericStoryLayer';
import '../../styles/slideAnimations.css';

/**
 * SlideAnimationLayer
 * Transparent atmospheric animation layer positioned directly over the static book spread.
 * - Chapter 1: Chapter1Atmosphere (The World of Veyra)
 * - Chapter 2: Chapter2Atmosphere (The Guardian and Kaelen)
 * - Chapter 6: Chapter6Atmosphere (Earth: The World She Chose)
 * - Chapter 7: Chapter7Atmosphere (Nova Today: The Starbound Guardian)
 * - Other chapters: AtmosphericStoryLayer (Chapter-specific atmospheric simulation)
 */
export default function SlideAnimationLayer({ slideId }) {
  return (
    <div className="slide-anim-container" aria-hidden="true">
      {slideId === 1 && <Chapter1Atmosphere />}
      {slideId === 2 && <Chapter2Atmosphere />}
      {slideId === 6 && <Chapter6Atmosphere />}
      {slideId === 7 && <Chapter7Atmosphere />}
      {slideId !== 1 && slideId !== 2 && slideId !== 6 && slideId !== 7 && (
        <AtmosphericStoryLayer slideId={slideId} />
      )}
    </div>
  );
}
