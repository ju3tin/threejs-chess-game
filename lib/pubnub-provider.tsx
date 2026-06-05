import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import PubNub from 'pubnub';
import { PubNubProvider as PubNubReactProvider, usePubNub } from 'pubnub-react';

type GameState = {
  players: Record<string, any>;
  // Add your game-specific state here (board, scores, position, etc.)
  currentTurn?: string;
  status: 'waiting' | 'playing' | 'finished';
  // ... other fields
};

type PubNubGameContextType = {
  gameState: GameState;
  sendGameMessage: (message: any) => void;
  joinGame: (gameId: string) => void;
  leaveGame: () => void;
  isConnected: boolean;
};

const PubNubGameContext = createContext<PubNubGameContextType | null>(null);

export function PubNubGameProvider({ 
  children, 
  publishKey, 
  subscribeKey,
  userId 
}: { 
  children: ReactNode; 
  publishKey: string; 
  subscribeKey: string;
  userId: string;
}) {
  const pubnubClient = new PubNub({
    publishKey,
    subscribeKey,
    uuid: userId,
  });

  return (
    <PubNubReactProvider client={pubnubClient}>
      <GameProviderInner userId={userId}>
        {children}
      </GameProviderInner>
    </PubNubReactProvider>
  );
}

function GameProviderInner({ children, userId }: { children: ReactNode; userId: string }) {
  const pubnub = usePubNub();
  const [gameState, setGameState] = useState<GameState>({
    players: {},
    status: 'waiting',
  });
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Listen for messages
  useEffect(() => {
    if (!currentChannel) return;

    const listener = {
      message: (messageEvent: any) => {
        const { message } = messageEvent;
        if (message.type === 'game_update') {
          setGameState(prev => ({ ...prev, ...message.payload }));
        }
        // Handle other message types: player_joined, move, etc.
      },
      status: (statusEvent: any) => {
        if (statusEvent.category === 'PNConnectedCategory') {
          setIsConnected(true);
        }
      }
    };

    pubnub.addListener(listener);
    pubnub.subscribe({ channels: [currentChannel] });

    return () => {
      pubnub.removeListener(listener);
      pubnub.unsubscribe({ channels: [currentChannel] });
    };
  }, [pubnub, currentChannel]);

  const joinGame = (gameId: string) => {
    const channel = `game-${gameId}`;
    setCurrentChannel(channel);
    
    // Announce presence
    pubnub.publish({
      channel,
      message: {
        type: 'player_joined',
        playerId: userId,
        timestamp: Date.now()
      }
    });
  };

  const leaveGame = () => {
    if (currentChannel) {
      pubnub.unsubscribe({ channels: [currentChannel] });
      setCurrentChannel(null);
    }
  };

  const sendGameMessage = (message: any) => {
    if (currentChannel) {
      pubnub.publish({
        channel: currentChannel,
        message
      });
    }
  };

  return (
    <PubNubGameContext.Provider value={{
      gameState,
      sendGameMessage,
      joinGame,
      leaveGame,
      isConnected
    }}>
      {children}
    </PubNubGameContext.Provider>
  );
}

export const usePubNubGame = () => {
  const context = useContext(PubNubGameContext);
  if (!context) {
    throw new Error('usePubNubGame must be used within PubNubGameProvider');
  }
  return context;
};
