declare const self: DedicatedWorkerGlobalScope;
export default {} as typeof Worker & { new (): Worker };

import { Vec2D, Color, lerp, clamp, randrange } from 'dynamojs-engine';
import { perlin } from '../Internal';

function blend(A: Color, B: Color) {
  const a = A.a / 255 + (B.a / 255) * (1 - A.a / 255);
  const r =
    (A.r / 255) * (A.a / 255) +
    ((B.r / 255) * (B.a / 255) * (1 - A.a / 255)) / a;
  const g =
    (A.g / 255) * (A.a / 255) +
    ((B.g / 255) * (B.a / 255) * (1 - A.a / 255)) / a;
  const b =
    (A.b / 255) * (A.a / 255) +
    ((B.b / 255) * (B.a / 255) * (1 - A.a / 255)) / a;
  return new Color(r * 255, g * 255, b * 255, a * 255);
}

function generateNebula(dimensions: Vec2D) {
  const data = new Uint8ClampedArray(4 * dimensions.x * dimensions.y);
  const layers = [
    {
      color: new Color(120, 120, 0),
      freq: 50,
      clip: 0.5,
    },
    {
      color: new Color(120, 70, 100),
      freq: 100,
      clip: 0.25,
    },
    {
      color: new Color(80, 30, 180),
      freq: 255,
      clip: 0.15,
    },
  ];
  for (let y = 0; y < dimensions.y; y++) {
    for (let x = 0; x < dimensions.x; x++) {
      let pixelData = new Color(0, 0, 0, 255);
      for (const layer of layers) {
        const t = perlin(x / layer.freq, y / layer.freq) - layer.clip;
        const color = new Color(
          layer.color.r,
          layer.color.g,
          layer.color.b,
          lerp(0, 255, clamp(t, 0, 1))
        );
        pixelData = blend(color, pixelData);
      }
      const i = 4 * (y * dimensions.x + x);
      data[i + 0] = pixelData.r;
      data[i + 1] = pixelData.g;
      data[i + 2] = pixelData.b;
      data[i + 3] = pixelData.a;
    }
  }
  return data;
}

function generatePlanet(radius: number) {
  const texture = [];

  const octaves = Math.floor(randrange(2, 7));
  const base = new Color(
    Math.random() * 255,
    Math.random() * 255,
    Math.random() * 255
  );
  const layers = [];
  for (let i = 0; i < octaves; i++) {
    let thresh;
    if (i === 0) thresh = Math.random() * (1 / octaves);
    else thresh = randrange(layers[i - 1].thresh, (i + 1) / octaves);
    layers.push({
      color: new Color(
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255
      ),
      scale: randrange(10, radius),
      thresh,
    });
  }

  // Generate the planet texture
  const persistence = Math.random() * 3;
  for (let y = 0; y < radius * 2; y++) {
    for (let x = 0; x < radius * 2; x++) {
      let pixelData = new Color(base.r, base.g, base.b);
      let t = 0;
      let frequency = 1;
      let amplitude = 1;
      let maxValue = 0;
      for (const layer of layers) {
        t +=
          perlin((x * frequency) / layer.scale, (y * frequency) / layer.scale) *
          amplitude;
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= 2;
      }
      t /= maxValue;
      for (let i = 1; i < layers.length; i++) {
        if (t >= layers[i - 1].thresh) {
          const color = new Color(
            layers[i].color.r,
            layers[i].color.g,
            layers[i].color.b,
            lerp(0, 255, t)
          );
          pixelData = blend(color, pixelData);
          break;
        }
      }
      texture.push(pixelData);
    }
  }

  // Map generated texture to a sphere
  // Include atmospheric halo
  const quarterTurn = Math.PI / 2;
  const data = new Uint8ClampedArray(4 * Math.pow(radius * 2, 2));
  for (let y = 0; y < radius * 2; y++) {
    for (let x = 0; x < radius * 2; x++) {
      const dy = y - radius;
      const dx = x - radius;
      const dSq = Math.pow(dx, 2) + Math.pow(dy, 2);

      let color = new Color(0, 0, 0, 0);
      if (dSq <= Math.pow(radius * 0.85, 2)) {
        const angle = Math.atan2(dy, dx);
        const A = Math.acos(Math.sqrt(dSq) / radius);
        const B = quarterTurn - A;
        const newDist = (radius * B) / quarterTurn;
        let sx = newDist * Math.cos(angle) + radius;
        let sy = newDist * Math.sin(angle) + radius;
        sx = clamp(Math.round(sx), 0, radius * 2 - 1);
        sy = clamp(Math.round(sy), 0, radius * 2 - 1);
        color = texture[sy * radius * 2 + sx];
      } else if (dSq <= radius * radius) {
        color = new Color(
          base.r,
          base.g,
          base.b,
          (255 * (radius * radius - dSq)) / (radius * radius)
        );
      }
      const i = 4 * (y * radius * 2 + x);
      data[i + 0] = color.r;
      data[i + 1] = color.g;
      data[i + 2] = color.b;
      data[i + 3] = color.a;
    }
  }
  return data;
}

self.addEventListener('message', (e) => {
  const { windowDimensions } = e.data;
  const nebula = generateNebula(windowDimensions);
  const planet = generatePlanet(300);

  self.postMessage({ nebula, planet });
});
