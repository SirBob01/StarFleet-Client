import { Color } from 'dynamojs-engine';
import styled from 'styled-components';

interface PixelProps {
  readonly size: number;
  readonly color: Color;
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
  background-color: ${({ color }) =>
    `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`};
  ${({ color }) => {
    if (color.a === 0) {
      return `
        background-image: url('assets/transparent.png');
        background-size: cover;
        image-rendering: pixelated;
      `;
    }
  }}

  border: 1px solid #AAAAAA;
  display: inline-block;
`;
