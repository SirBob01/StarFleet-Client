import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { SketchPicker as ColorPicker } from 'react-color';
import { Editor } from './Editor';

import { Color } from 'dynamojs-engine';
import { Socket } from 'socket.io-client';
import {
  EditorContainer,
  LobbyContainer,
  NameChangeButton,
  NameContainer,
  NameInput,
  PlayerContainer,
} from './LobbyStyles';
import {
  EmitEvents,
  ListenEvents,
  LobbyPlayer,
  StartData,
} from 'starfleet-server';
import Player from './Player';

const scoutSize = 6;
const fighterSize = 8;
const carrierSize = 16;

const generatePixelArray = (size: number) => {
  return Array(size * size).fill({ r: 255, g: 255, b: 255, a: 0 });
};

interface LobbyProps {
  socket: Socket<EmitEvents, ListenEvents>;
}

function Lobby({ socket }: LobbyProps) {
  const navigate = useNavigate();
  const { lobbyKey } = useParams<string>();

  const [color, setColor] = useState<Color>(new Color(255, 255, 255));
  const [scoutPixels, setScoutPixels] = useState<Color[]>(
    generatePixelArray(scoutSize)
  );
  const [fighterPixels, setFighterPixels] = useState<Color[]>(
    generatePixelArray(fighterSize)
  );
  const [carrierPixels, setCarrierPixels] = useState<Color[]>(
    generatePixelArray(carrierSize)
  );

  const [name, setName] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const [playerList, setPlayerList] = useState<LobbyPlayer[]>([]);
  const [startData, setStartData] = useState<StartData | null>(null);

  // Socket listeners on initialization to interact with the server
  useEffect(() => {
    if (lobbyKey) {
      socket.emit('join', lobbyKey, (success: boolean) => {
        if (!success) {
          navigate('/', {
            replace: true,
            state: 'Lobby does not exist',
          });
        }
      });
    }

    socket.on('lobby', (data) => {
      const host = data.players.find((player) => player.host);
      setPlayerList(data.players);
      setName(data.playerName);
      setIsHost(host?.id === data.playerId);
    });

    socket.on('kick', () => {
      navigate('/', {
        replace: true,
        state: 'You have been kicked from the lobby!',
      });
    });

    socket.on('start', (data) => {
      setStartData(data);
    });
  }, []);

  // Handle starting the game
  useEffect(() => {
    if (startData !== null) {
      navigate('play', { state: startData });
    }
  }, [startData]);

  // Handle ship pixel editing
  useEffect(() => {
    socket.emit('setPixelData', {
      scout: { size: scoutSize, colors: scoutPixels },
      fighter: { size: fighterSize, colors: fighterPixels },
      carrier: { size: carrierSize, colors: carrierPixels },
    });
  }, [scoutPixels, fighterPixels, carrierPixels]);

  return (
    <LobbyContainer>
      <EditorContainer>
        <Editor
          currentColor={color}
          pixelUpdater={setScoutPixels}
          width={scoutSize}
          height={scoutSize}
        />
        <Editor
          currentColor={color}
          pixelUpdater={setFighterPixels}
          width={fighterSize}
          height={fighterSize}
        />
        <Editor
          currentColor={color}
          pixelUpdater={setCarrierPixels}
          width={carrierSize}
          height={carrierSize}
        />
        <ColorPicker
          color={color}
          onChange={(color) =>
            setColor(
              new Color(color.rgb.r, color.rgb.g, color.rgb.b, color.rgb.a)
            )
          }
        />
      </EditorContainer>

      <NameContainer>
        <NameInput
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <NameChangeButton onClick={() => socket.emit('setName', name)}>
          Change Name
        </NameChangeButton>
      </NameContainer>

      <PlayerContainer>
        {playerList.map((player: LobbyPlayer) => (
          <Player
            key={player.id}
            playerData={player}
            isHost={isHost}
            socket={socket}
          />
        ))}
      </PlayerContainer>
    </LobbyContainer>
  );
}

export default Lobby;
