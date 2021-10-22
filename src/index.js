import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { io as Socket } from 'socket.io-client'

import './index.css'
import Home from './home'
import Lobby from './lobby'

import reportWebVitals from './reportWebVitals'

// Connect to the server
const socket = new Socket('http://localhost:3200')

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route path='/:lobbyKey'>
          <Lobby socket={socket} />
        </Route>
        <Route path='/'>
          <Home socket={socket} />
        </Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
