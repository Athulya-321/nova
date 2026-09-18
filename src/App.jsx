import React, { useEffect } from 'react';
import { useNova, AppModes } from './context/NovaContext';
import { preloadStoryImages } from './services/storyPreloader';
import CinematicOpening from './components/Environment/CinematicOpening';
import Navigation from './components/UI/Navigation';
import Starways from './components/Environment/Starways';
import Particles from './components/Environment/Particles';
import NovaCharacter from './components/Nova/NovaCharacter';
import VisitorStar from './components/Nova/VisitorStar';
import ConversationUI from './components/UI/ConversationUI';
import CosmicSight from './components/UI/CosmicSight';
import StoryExperience from './components/Story/StoryExperience';
import PowersExperience from './components/Powers/PowersExperience';
import CosmicMap from './components/UI/CosmicMap';
import HelpSignals from './components/Environment/HelpSignals';
import InspiredHome from './components/Environment/InspiredHome';
import MeteorEmergency from './components/Environment/MeteorEmergency';
import CustomCursor from './components/UI/CustomCursor';
import './styles/ui.css';
import './styles/starways.css';
import './styles/inspired.css';

function MainExperience() {
  return (
    <>
      <InspiredHome />
      <Particles />
      <VisitorStar />
      <CosmicSight />
      <ConversationUI />
    </>
  );
}

function AppRenderer() {
  const { appMode } = useNova();

  useEffect(() => {
    // Silently preload and GPU-decode all story slides in background
    preloadStoryImages();
  }, []);
  
  return (
    <div className="app-container">
      <CustomCursor />
      <CinematicOpening />
      <Navigation />
      
      {appMode === AppModes.HOME && <MainExperience />}
      {appMode === AppModes.MEET_NOVA && <StoryExperience />}
      {appMode === AppModes.POWERS && <PowersExperience />}
      {appMode === AppModes.MAP && <CosmicMap />}
      {appMode === AppModes.STARWAYS && <Starways isExploreMode={true} />}
      {appMode === AppModes.HELP_SIGNALS && <HelpSignals />}
      
      {/* Cinematic Meteor Emergency Event (only when not reading Meet Nova storybook) */}
      {appMode !== AppModes.MEET_NOVA && <MeteorEmergency />}
    </div>
  );
}

export default function App() {
  return <AppRenderer />;
}
