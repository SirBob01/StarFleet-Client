import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';

import './index.css';
import { Home } from './Home';
import { Lobby } from './Lobby';

import reportWebVitals from './reportWebVitals';

// Connect to the server
const socket = io('http://localhost:3200');

// eslint-disable-next-line
const container = createRoot(document.getElementById('root')!);
container.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/:lobbyKey" element={ <Lobby socket={socket} /> } />
        <Route path="/" element={<Home socket={socket} />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
