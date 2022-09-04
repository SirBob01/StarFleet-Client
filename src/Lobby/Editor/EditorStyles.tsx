import { Color } from 'dynamojs-engine';
import styled from 'styled-components';

interface PixelProps {
  readonly size: number;
  readonly rgba: Color;
}

export const EditorContainer = styled.div`
  text-align: center;
  color: white;
  display: inline-block;
`;

export const PixelContainer = styled.div`
  font-size: 0;
`;

export const Pixel = styled.div<PixelProps>`
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
  ${({ rgba }) => {
    const { r, g, b, a } = rgba;
    if (a === 0) {
      return `
        background-image: url('assets/transparent.png');
        background-size: cover;
        image-rendering: pixelated;
      `;
    } else {
      return `background-color: rgba(${r}, ${g}, ${b}, ${a});`;
    }
  }}

  border: 1px solid #AAAAAA;
  display: inline-block;
`;

export const Label = styled.span``;
