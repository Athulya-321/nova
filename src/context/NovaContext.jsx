import React, { createContext, useContext, useState, useEffect } from 'react';

// Full sequence of states
export const NovaStates = {
  // Opening Sequence
  OPENING_BLACK: 'OPENING_BLACK',
  SIGNAL_DETECTED: 'SIGNAL_DETECTED',
  STARS_AWAKEN: 'STARS_AWAKEN',
  NOVA_FAR: 'NOVA_FAR',
  NOVA_NOTICES: 'NOVA_NOTICES',
  NOVA_APPROACHING: 'NOVA_APPROACHING',
  PORTAL_ENTRY: 'PORTAL_ENTRY',
  NOVA_LANDS: 'NOVA_LANDS',
  
  // Main States
  IDLE: 'IDLE',
  LISTENING: 'LISTENING',
  SERIOUS: 'SERIOUS',
  COSMIC_SIGHT: 'COSMIC_SIGHT',
  SUCCESS: 'SUCCESS',
};

export const NovaEmotions = {
  CURIOUS: 'CURIOUS',
  PLAYFUL: 'PLAYFUL',
  HAPPY: 'HAPPY',
  THOUGHTFUL: 'THOUGHTFUL',
  SERIOUS: 'SERIOUS',
  CONCERNED: 'CONCERNED',
  POWER_ACTIVATION: 'POWER_ACTIVATION',
  IDLE: 'IDLE'
};

export const ConversationPhases = {
  NONE: 'NONE', // Before she reaches the user
  INTRO: 'INTRO',
  ASK_NAME: 'ASK_NAME',
  ASK_AGE: 'ASK_AGE',
  ASK_LOCATION: 'ASK_LOCATION',
  ASK_EMAIL: 'ASK_EMAIL',
  ASK_PROBLEM: 'ASK_PROBLEM',
  CONFIRMATION: 'CONFIRMATION',
  SIGNAL_RECEIVED: 'SIGNAL_RECEIVED',
  FINISHED: 'FINISHED',
};

export const AppModes = {
  HOME: 'HOME',
  POWERS: 'POWERS',
  STARWAYS: 'STARWAYS',
  MAP: 'MAP',
  HELP_SIGNALS: 'HELP_SIGNALS',
  MEET_NOVA: 'MEET_NOVA'
};

const NovaContext = createContext();

export const useNova = () => {
  const context = useContext(NovaContext);
  if (!context) {
    throw new Error('useNova must be used within a NovaProvider');
  }
  return context;
};

export const NovaProvider = ({ children }) => {
  // Initial state is the very beginning of the sequence
  const [novaState, setNovaState] = useState(NovaStates.OPENING_BLACK);
  const [novaEmotion, setNovaEmotion] = useState(NovaEmotions.CURIOUS);
  const [conversationPhase, setConversationPhase] = useState(ConversationPhases.NONE);
  const [appMode, setAppMode] = useState(AppModes.HOME);
  
  const [visitorData, setVisitorData] = useState({
    name: '',
    age: '',
    location: '',
    email: '',
    problem: '',
  });

  const updateVisitorData = (key, value) => {
    setVisitorData(prev => ({ ...prev, [key]: value }));
  };

  const advanceConversation = (nextPhase, newEmotion = null, newState = null) => {
    setConversationPhase(nextPhase);
    if (newEmotion) setNovaEmotion(newEmotion);
    if (newState) setNovaState(newState);
  };

  // The Opening Cinematic Sequencer
  useEffect(() => {
    let timers = [];
    if (novaState === NovaStates.OPENING_BLACK) {
      timers.push(setTimeout(() => setNovaState(NovaStates.SIGNAL_DETECTED), 500));
    } else if (novaState === NovaStates.SIGNAL_DETECTED) {
      timers.push(setTimeout(() => setNovaState(NovaStates.STARS_AWAKEN), 1000));
    } else if (novaState === NovaStates.STARS_AWAKEN) {
      timers.push(setTimeout(() => setNovaState(NovaStates.NOVA_FAR), 1500));
    } else if (novaState === NovaStates.NOVA_FAR) {
      timers.push(setTimeout(() => setNovaState(NovaStates.NOVA_NOTICES), 1000));
    } else if (novaState === NovaStates.NOVA_NOTICES) {
      timers.push(setTimeout(() => setNovaState(NovaStates.NOVA_APPROACHING), 1000));
    } else if (novaState === NovaStates.NOVA_APPROACHING) {
      // She runs for 3 seconds, then enters portal
      timers.push(setTimeout(() => setNovaState(NovaStates.PORTAL_ENTRY), 3000));
    } else if (novaState === NovaStates.PORTAL_ENTRY) {
      timers.push(setTimeout(() => setNovaState(NovaStates.NOVA_LANDS), 800));
    } else if (novaState === NovaStates.NOVA_LANDS) {
      timers.push(setTimeout(() => {
        setNovaState(NovaStates.IDLE);
        setConversationPhase(ConversationPhases.INTRO);
        // Shortly after intro, ask name
        timers.push(setTimeout(() => {
          advanceConversation(ConversationPhases.ASK_NAME, NovaEmotions.CURIOUS);
        }, 1500));
      }, 1000));
    }

    return () => timers.forEach(clearTimeout);
  }, [novaState]);

  return (
    <NovaContext.Provider value={{
      novaState, setNovaState,
      novaEmotion, setNovaEmotion,
      conversationPhase, setConversationPhase,
      visitorData, updateVisitorData,
      advanceConversation,
      appMode, setAppMode
    }}>
      {children}
    </NovaContext.Provider>
  );
};
