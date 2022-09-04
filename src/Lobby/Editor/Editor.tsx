import { Color } from 'dynamojs-engine';
import React, { useState } from 'react';
import { EditorContainer, PixelContainer, Pixel, Label } from './EditorStyles';

interface EditorProps {
  width: number;
  height: number;
  currentColor: Color;
  pixelUpdater: (pixels: Color[]) => void;
}

/**
 * Pixel editor component
 */
function Editor({ width, height, currentColor, pixelUpdater }: EditorProps) {
  const [pixels, setPixels] = useState<Color[]>(
    Array(width * height).fill(new Color(255, 255, 255, 0))
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
      <Label>Front</Label>
      <PixelContainer>
        {pixels.map((pixel, index) => {
          const pix = (
            <Pixel
              key={`pixel-${index}`}
              onMouseEnter={() => {
                if (mouseHold) updatePixels(index);
              }}
              onMouseDown={() => updatePixels(index)}
              rgba={pixel}
              size={16}
            />
          );
          if ((index + 1) % width === 0) {
            return (
              <span key={`pixel-row-${index}`}>
                {pix}
                <br />
              </span>
            );
          }
          return pix;
        })}
      </PixelContainer>
      <Label>Back</Label>
    </EditorContainer>
  );
}

export default Editor;
