import { Color } from 'dynamojs-engine';
import React, { MouseEvent, useState } from 'react';
import { EditorContainer, PixelContainer, Pixel, Label } from './EditorStyles';

interface EditorProps {
  width: number;
  height: number;
  currentColor: Color;
  pixelUpdater: (pixels: Color[]) => void;
}

/**
 * Pixel editor can be set to specified dimensions
 */
function Editor({ width, height, currentColor, pixelUpdater }: EditorProps) {
  const [pixels, setPixels] = useState<Color[]>(
    Array(width * height).fill(new Color(255, 255, 255, 0))
  );
  const [dragging, setDragging] = useState<boolean>(false);

  // Invalidate pixel array cache
  const updatePixels = (index: number) => {
    const newPixels = pixels.slice();
    newPixels[index] = currentColor;
    setPixels(newPixels);
    pixelUpdater(pixels);
  };

  // Handler for starting dragging
  const startDragging = (event: MouseEvent) => {
    event.preventDefault();
    setDragging(true);
  };

  // Handler for stopping dragging
  const stopDragging = (event: MouseEvent) => {
    event.preventDefault();
    setDragging(false);
  };

  return (
    <EditorContainer onMouseDown={startDragging} onMouseUp={stopDragging}>
      <Label>Front</Label>
      <PixelContainer>
        {pixels.map((pixel, index) => {
          const dragUpdate = () => {
            if (dragging) {
              updatePixels(index);
            }
          };
          const clickUpdate = () => {
            updatePixels(index);
          };
          const pix = (
            <Pixel
              key={`pixel-${index}`}
              onMouseEnter={dragUpdate}
              onMouseDown={clickUpdate}
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
