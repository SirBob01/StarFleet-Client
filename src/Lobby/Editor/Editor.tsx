import { Color } from 'dynamojs-engine';
import React, { useState } from 'react';
import { EditorContainer, Pixel, PixelContainer } from './EditorStyles';

interface EditorProps {
  currentColor: Color;
  pixelUpdater: (pixels: Color[]) => void;
  width: number;
  height: number;
}

function Editor({ currentColor, pixelUpdater, width, height }: EditorProps) {
  const [pixels, setPixels] = useState(
    Array(width * height).fill({ r: 255, g: 255, b: 255, a: 0 })
  );
  const [mouseHold, setMouseHold] = useState(false);

  // Invalidate pixel array cache
  const updatePixels = (index: number) => {
    const newPixels = pixels.slice();
    newPixels[index] = currentColor;
    setPixels(newPixels);
    pixelUpdater(pixels);
  };

  return (
    <EditorContainer
      onMouseDown={() => setMouseHold(true)}
      onMouseUp={() => setMouseHold(false)}
    >
      <span>Front</span>
      <PixelContainer>
        {pixels.map((pixel, index) => {
          const pix = (
            <Pixel
              key={`pixel-${index}`}
              onMouseEnter={() => {
                if (mouseHold) updatePixels(index);
              }}
              onMouseDown={() => updatePixels(index)}
              color={pixel}
              size={16}
            />
          );
          if ((index + 1) % width === 0) {
            return (
              <span key={`pixel-${index}`}>
                {pix}
                <br />
              </span>
            );
          }
          return pix;
        })}
      </PixelContainer>
      <span>Back</span>
    </EditorContainer>
  );
}

export default Editor;
