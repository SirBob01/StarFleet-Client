import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

interface HomeProps {
  socket: Socket;
}

function Home({ socket }: HomeProps) {
  const navigate = useNavigate();

  const [hostKey, setHostKey] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState<string | null>(null);

  useEffect(() => {
    if (hostKey !== null) {
      navigate(`/${hostKey}`, { replace: true });
    }
  }, [hostKey]);

  const createGame = () => {
    socket.emit('create', (key: string) => {
      setHostKey(key);
    });
  };
  const joinGame = () => {
    socket.emit('join', keyInput, (success: boolean) => {
      if (success) {
        setHostKey(keyInput);
      } else {
        alert('Game does not exist with this key!');
      }
    });
  };

  return (
    <div>
      Starfleet
      <button onClick={createGame}>Create Game</button>
      <input type="text" onChange={(e) => setKeyInput(e.target.value)} />
      <button onClick={joinGame}>Join Game</button>
    </div>
  );
}

export default Home;
