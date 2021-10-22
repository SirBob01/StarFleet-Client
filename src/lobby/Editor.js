import React, { useState } from 'react'
import styled from 'styled-components'
import transparent from '../images/transparent.png'

const EditorContainer = styled.div`
  text-align: center;
  color: white;
  display: inline-block
`

const PixelContainer = styled.div`
  font-size: 0;
`;

const Pixel = styled.div`
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
  background-color: ${({ color }) => `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`};
  ${({ color }) => {
    if (color.a === 0) {
      return `
        background-image: url(${transparent});
        background-size: cover;
        image-rendering: pixelated;
      `
    }
  }}

  border: 1px solid #AAAAAA;
  display: inline-block;
`

export default function Editor ({ currentColor, pixelUpdater, width, height }) {
  const [pixels, setPixels] = useState(Array(width * height).fill({ r: 255, g: 255, b: 255, a: 0 }))
  const [mouseHold, setMouseHold] = useState(false)

  const updatePixels = (index) => {
    const newPixels = pixels.slice()
    newPixels[index] = currentColor
    setPixels(newPixels)
    pixelUpdater(pixels)
  }

  return (
    <EditorContainer onMouseDown={() => setMouseHold(true)} onMouseUp={() => setMouseHold(false)}>
      <span>Front</span>
      <PixelContainer>
        {pixels.map((pixel, index) => {
          const pix = (
            <Pixel
              key={`pixel-${index}`}
              onMouseEnter={() => { if (mouseHold) updatePixels(index) }}
              onMouseDown={() => updatePixels(index)}

              color={pixel}
              size={16}
            />
          )
          if ((index + 1) % width === 0) {
            return (
              <>
                {pix}
                <br/>
              </>
            )
          }
          return pix
        })}
      </PixelContainer>
      <span>Back</span>
    </EditorContainer>
  )
}
