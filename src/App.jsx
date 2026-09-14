import React from 'react';
import { useNova, AppModes } from './context/NovaContext';
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
    </div>
  );
}

export default function App() {
  return <AppRenderer />;
}
