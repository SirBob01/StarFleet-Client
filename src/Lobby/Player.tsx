import React from 'react';
import { Socket } from 'socket.io-client';
import { EmitEvents, ListenEvents, LobbyPlayer } from 'starfleet-server';
import {
  PlayerRow,
  HostName,
  StartButton,
  MemberName,
  KickButton,
} from './LobbyStyles';

interface PlayerProps {
  playerData: LobbyPlayer;
  isHost: boolean;
  socket: Socket<EmitEvents, ListenEvents>;
}

/**
 * Individual player entry in the lobby list
 */
function Player({ playerData, isHost, socket }: PlayerProps) {
  // Handler for starting a game
  const onStart = () => {
    socket.emit('start');
  };

  // Handler for kicking the player
  const onKick = () => {
    socket.emit('kick', playerData.id);
  };

  if (playerData.host) {
    return (
      <PlayerRow key={playerData.id}>
        <HostName>{playerData.name}</HostName>
        {isHost && <StartButton onClick={onStart}>Start</StartButton>}
      </PlayerRow>
    );
  }
  return (
    <PlayerRow key={playerData.id}>
      <MemberName>{playerData.name}</MemberName>
      {isHost && <KickButton onClick={onKick}>Kick</KickButton>}
    </PlayerRow>
  );
}

export default Player;
