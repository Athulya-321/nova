import React from 'react';
import '../../styles/slideAnimations.css';

// Slide 1: The World of Veyra (Living, Peaceful World)
function Slide1Layer() {
  return (
    <>
      <div className="s1-atmosphere-mist" />
      <div className="s1-aurelis-glow" />
      <div className="s1-island-float-1" />
      <div className="s1-island-float-2" />
      <div className="s1-island-float-3" />
      <div className="s1-waterfall-stream-left" />
      <div className="s1-waterfall-stream-right" />
      <div className="s1-rings-shimmer" />
    </>
  );
}

// Slide 2: The Guardian and Kaelen
function Slide2Layer() {
  return (
    <>
      <div className="s2-starway-pulse" />
      <div className="s2-table-crystal" />
      <div className="s2-floor-runes-trail" />
    </>
  );
}

// Slide 3: The Fall of Veyra
function Slide3Layer() {
  return (
    <>
      <div className="s3-sky-heat-pulse" />
      <div className="s3-portal-lightning" />
      <div className="s3-flame-ruins-1" />
      <div className="s3-flame-ruins-2" />
    </>
  );
}

// Slide 4: The Last Light of Aurelis
function Slide4Layer() {
  return (
    <>
      <div className="s4-emotional-vignette" />
      <div className="s4-dying-aurelis-fade" />
      <div className="s4-core-heartbeat" />
    </>
  );
}

// Slide 5: The Guardian Without a Home
function Slide5Layer() {
  return (
    <>
      <div className="s5-lonely-atmosphere" />
      <div className="s5-campfire-flicker" />
      <div className="s1-waterfall-stream-left" style={{ top: '35%', left: '23%' }} />
      <div className="s1-rings-shimmer" style={{ top: '12%', left: '30%', width: '42%' }} />
    </>
  );
}

// Slide 6: Earth, The World She Chose
function Slide6Layer() {
  return (
    <>
      <div className="s6-sunset-glow" />
      <div className="s6-leaves-sway" />
      <div className="s6-nova-tail-glow" />
    </>
  );
}

// Slide 7: Nova Today
function Slide7Layer() {
  return (
    <>
      <div className="s7-nebula-clouds" />
      <div className="s7-forehead-crystal-pulse" />
      <div className="s7-platform-runes" />
    </>
  );
}

export default function SlideAnimationLayer({ slideId }) {
  return (
    <div className="slide-anim-container">
      {slideId === 1 && <Slide1Layer />}
      {slideId === 2 && <Slide2Layer />}
      {slideId === 3 && <Slide3Layer />}
      {slideId === 4 && <Slide4Layer />}
      {slideId === 5 && <Slide5Layer />}
      {slideId === 6 && <Slide6Layer />}
      {slideId === 7 && <Slide7Layer />}
    </div>
  );
}
