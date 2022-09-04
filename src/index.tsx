import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { EmitEvents, ListenEvents } from 'starfleet-server';

import './index.css';
import { Home } from './Home';
import { Lobby } from './Lobby';
import { Game } from './Game';

import reportWebVitals from './reportWebVitals';

const root = document.getElementById('root');
if (root) {
  // Connect to the server
  const socket: Socket<EmitEvents, ListenEvents> = io('http://localhost:3200');
  const container = createRoot(root);
  container.render(
    <React.StrictMode>
      <Router>
        <Routes>
          <Route path="/:lobbyKey" element={<Lobby socket={socket} />} />
          <Route path="/:lobbyKey/play" element={<Game socket={socket} />} />
          <Route path="/" element={<Home socket={socket} />} />
        </Routes>
      </Router>
    </React.StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
