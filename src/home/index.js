import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'

export default function Home ({ socket }) {
  const [hostKey, setHostKey] = useState(null)
  const [keyInput, setKeyInput] = useState(null)

  const createGame = () => {
    socket.emit('create', key => {
      setHostKey(key)
    })
  }
  const joinGame = () => {
    socket.emit('join', keyInput, success => {
      if (success) {
        setHostKey(keyInput)
      } else {
        alert('Game does not exist with this key!')
      }
    })
  }

  if (hostKey !== null) return <Redirect to={`/${hostKey}`} />
  return (
    <div>
      Starfleet
      <button onClick={createGame}>Create Game</button>
      <input type='text' onChange={(e) => setKeyInput(e.target.value)} />
      <button onClick={joinGame}>Join Game</button>
    </div>
  )
}
