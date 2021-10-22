import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import dynamo from 'dynamojs-engine'
import { Redirect, useParams } from 'react-router'
import { SketchPicker as ColorPicker } from 'react-color'
import Editor from './Editor'

const SpaceColor = '#000055'

const LobbyContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${SpaceColor};
  overflow: auto;
`

export default function Lobby ({ socket }) {
  const { lobbyKey } = useParams()
  const [color, setColor] = useState({ r: 255, g: 255, b: 255, a: 1 })
  const [returnHome, setReturnHome] = useState(false)

  useEffect(() => {
    socket.emit('join', lobbyKey, success => {
      if (!success) {
        alert('Game does not exist with this key!')
        setReturnHome(true)
      }
    })
  }, [])

  if (returnHome) return <Redirect to='/' />
  return (
    <LobbyContainer>
      <ColorPicker color={color} onChange={color => setColor(color.rgb)} />
      <Editor currentColor={color} pixelUpdater={() => {}} width={8} height={8} />
    </LobbyContainer>
  )
}
