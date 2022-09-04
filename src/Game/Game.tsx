import React, { useEffect } from 'react';
import dynamo from 'dynamojs-engine';
import { Socket } from 'socket.io-client';
import { EmitEvents, ListenEvents, StartData } from 'starfleet-server';
import { Loading } from './States';
import { GameContainer } from './GameStyles';
import { useLocation, useNavigate } from 'react-router-dom';

interface GameProps {
  socket: Socket<EmitEvents, ListenEvents>;
}

/**
 * Game component runs the main loop and simulation logic
 */
function Game({ socket }: GameProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Start the game on load
  // If the data is invalid, navigate back to the home page
  useEffect(() => {
    const startData = location.state as StartData;
    if (startData) {
      const engine = new dynamo.Engine(new Loading(socket, startData));
      engine.run();
    } else {
      navigate('/', { replace: true });
    }
  }, []);

  return <GameContainer id={'display'} />;
}

export default Game;
