import React, { useEffect, useState } from 'react'
import { Redirect, useParams } from 'react-router'
import styled from 'styled-components'

import { SketchPicker as ColorPicker } from 'react-color'
import Editor from './Editor'

import dynamo from 'dynamojs-engine'
import Loading from '../game/Main'

const Game = styled.canvas`
  top: 0;
  left: 0;  
  width: 100%;
  height: 100%;
  position: fixed;
  overflow: hidden;
`

const LobbyContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: rgb(0, 0, 33);
  overflow: hidden;
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

const scoutSize = 6
const fighterSize = 8
const carrierSize = 16

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
  const [startData, setStartData] = useState(null)

  const [returnHome, setReturnHome] = useState(false)

  useEffect(() => {
    let isMounted = true
    socket.emit('join', lobbyKey, success => {
      if (isMounted) {
        if (!success) {
          alert('Game does not exist with this key!')
          setReturnHome(true)
        }
      }
    })

    socket.on('lobby', data => {
      if (isMounted) {
        setPlayerList(data.players)
        setName(data.name)
        setIsHost(data.isHost)
      }
    })

    socket.on('kick', () => {
      if (isMounted) {
        alert('You have been kicked from the game!')
        setReturnHome(true)
      }
    })

    socket.on('start', data => {
      if (isMounted) {
        setStartData(data)
      }
    })
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    if (startData !== null) {
      const engine = new dynamo.Engine(new Loading(socket, startData))
      engine.run()
    }
  }, [startData])

  useEffect(() => {
    socket.emit('setPixelData', {
      scout: { size: scoutSize, buffer: scoutPixels },
      fighter: { size: fighterSize, buffer: fighterPixels },
      carrier: { size: carrierSize, buffer: carrierPixels }
    })
  }, [scoutPixels, fighterPixels, carrierPixels])

  if (returnHome) return <Redirect to='/' />
  return (
    <>
      {startData
        ? <Game id='display' />
        : <LobbyContainer>
          <EditorContainer>
            <Editor currentColor={color} pixelUpdater={setScoutPixels} width={scoutSize} height={scoutSize} />
            <Editor currentColor={color} pixelUpdater={setFighterPixels} width={fighterSize} height={fighterSize} />
            <Editor currentColor={color} pixelUpdater={setCarrierPixels} width={carrierSize} height={carrierSize} />
            <ColorPicker color={color} onChange={color => setColor(color.rgb)} />
          </EditorContainer>

          <NameContainer>
            <NameInput type='text' value={name} onChange={e => setName(e.target.value)} />
            <button onClick={() => socket.emit('setName', name)}>Change Name</button>
          </NameContainer>

          <PlayerContainer>
            {playerList.map((player, index) => {
              if (player.host) {
                return (
                  <PlayerRow key={player.id}>
                    <span style={{ color: 'red' }}>{player.name}</span>
                    {isHost ? <button onClick={() => socket.emit('start')}>Start</button> : null}
                    <br />
                  </PlayerRow>
                )
              } else {
                return (
                  <PlayerRow key={player.id}>
                    <span style={{ color: 'white' }}>{player.name}</span>
                    {isHost ? <button onClick={() => socket.emit('kick', player.id)}>Kick</button> : null}
                    <br />
                  </PlayerRow>
                )
              }
            })}
          </PlayerContainer>
          </LobbyContainer>}
    </>
  )
}
