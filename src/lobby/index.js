import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import dynamo from 'dynamojs-engine'
import { Redirect, useParams } from 'react-router'
import { SketchPicker as ColorPicker } from 'react-color'
import Editor from './Editor'

const LobbyContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: #000055;
  overflow: auto;
`

const EditorContainer = styled.div`

`

const NameContainer = styled.div`

`

const NameInput = styled.input`

`

const PlayerContainer = styled.div`

`

const PlayerRow = styled.div`

`

const scoutSize = 8;
const fighterSize = 12;
const carrierSize = 24;

const generatePixelArray = (size) => {
  return Array(size * size).fill({ r: 255, g: 255, b: 255, a: 0 })
}

export default function Lobby ({ socket }) {
  const { lobbyKey } = useParams()
  const [color, setColor] = useState({ r: 255, g: 255, b: 255, a: 1 })
  
  const [scoutPixels, setScoutPixels] = useState(generatePixelArray(scoutSize))
  const [fighterPixels, setFighterPixels] = useState(generatePixelArray(fighterSize))
  const [carrierPixels, setCarrierPixels] = useState(generatePixelArray(carrierSize))

  const [name, setName] = useState('')
  const [isHost, setIsHost] = useState(false)
  const [playerList, setPlayerList] = useState([])

  const [returnHome, setReturnHome] = useState(false)

  useEffect(() => {
    socket.emit('join', lobbyKey, success => {
      if (!success) {
        alert('Game does not exist with this key!')
        setReturnHome(true)
      }
    })

    socket.on('lobby', data => {
      setPlayerList(data.players)
      setName(data.name)
      setIsHost(data.isHost)
    })

    socket.on('kick', () => {
      alert('You have been kicked from the game!')
      setReturnHome(true)
    })
  }, [])

  const updateName = () => {
    socket.emit('setName', name)
  }

  const updateSprites = () => {
    socket.emit('setPixelData', {
      scout: scoutPixels,
      fighter: fighterPixels,
      carrier: carrierPixels
    })
  }

  const startGame = () => {
    socket.emit('start')
  }

  const kickPlayer = (id) => {
    socket.emit('kick', id)
  }

  if (returnHome) return <Redirect to='/' />
  return (
    <LobbyContainer>
      <EditorContainer>
        <Editor currentColor={color} pixelUpdater={setScoutPixels} width={8} height={8} />
        <Editor currentColor={color} pixelUpdater={setFighterPixels} width={12} height={12} />
        <Editor currentColor={color} pixelUpdater={setCarrierPixels} width={24} height={24} />
        <ColorPicker color={color} onChange={color => setColor(color.rgb)} />
        <button onClick={updateSprites}>Save</button>
      </EditorContainer>
      
      <NameContainer>
        <NameInput type='text' value={name} onChange={e => setName(e.target.value)}/>
        <button onClick={updateName}>Change Name</button>
      </NameContainer>

      <PlayerContainer>
        {playerList.map((player, index) => {
          if(player.host) {
            return (
              <PlayerRow>
                <span style={{color: 'red'}}>{player.name}</span>
                {isHost ? <button onClick={startGame}>Start</button> : null}
                <br/>
              </PlayerRow>
            )
          }
          else {
            return (
              <PlayerRow>
                <span style={{color: 'white'}}>{player.name}</span>
                {isHost ? <button onClick={() => kickPlayer(player.id)}>Kick</button> : null }
                <br/>
              </PlayerRow>
            )
          }
        })}
      </PlayerContainer>
    </LobbyContainer>
  )
}
