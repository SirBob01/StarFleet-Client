import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { EmitEvents, ListenEvents } from 'starfleet-server';
import { HomeContainer, CreateButton, CodeInput, JoinButton } from './HomeStyles';

interface HomeProps {
  socket: Socket<EmitEvents, ListenEvents>;
}

/**
 * Home page
 * 
 * Here, the user can either create a new game lobby or join an 
 * existing one by typing in a code
 */
function Home({ socket }: HomeProps) {
  const navigate = useNavigate();

  const [hostKey, setHostKey] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState<string>('');

  // Navigate to the entered host key if valid
  useEffect(() => {
    if (hostKey !== null) {
      navigate(`/${hostKey}`, { replace: true });
    }
  }, [hostKey]);

  // Handler for creating a new lobby
  const createLobby = () => {
    socket.emit('create', (key: string) => {
      setHostKey(key);
    });
  };
  
  // Handler for joining an existing lobby
  const joinLobby = () => {
    socket.emit('join', keyInput, (success: boolean) => {
      if (success) {
        setHostKey(keyInput);
      } else {
        alert('Game does not exist with this key!');
      }
    });
  };

  return (
    <HomeContainer>
      Starfleet
      <CreateButton onClick={createLobby}>Create Game</CreateButton>
      <CodeInput type="text" onChange={(e) => setKeyInput(e.target.value)} />
      <JoinButton onClick={joinLobby}>Join Game</JoinButton>
    </HomeContainer>
  );
}

export default Home;
