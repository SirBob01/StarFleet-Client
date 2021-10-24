import dynamo from 'dynamojs-engine'
import perlin from './perlin'  

function blend(A, B) {
  let a = (A.a / 255) + (B.a / 255) * (1 - A.a / 255)
  let r = (A.r / 255) * (A.a / 255) + (B.r / 255) * (B.a / 255) * (1 - A.a / 255) / a
  let g = (A.g / 255) * (A.a / 255) + (B.g / 255) * (B.a / 255) * (1 - A.a / 255) / a
  let b = (A.b / 255) * (A.a / 255) + (B.b / 255) * (B.a / 255) * (1 - A.a / 255) / a
  return new dynamo.Color(r * 255, g * 255, b * 255, a * 255)
}

function generateNebula (dimensions) {
  let data = []
  const colors = [
    new dynamo.Color(80, 30, 180),
    new dynamo.Color(120, 70, 100),
    new dynamo.Color(120, 120, 0),
  ]
  for(let y = 0; y < dimensions.y; y++) {
    for(let x = 0; x < dimensions.x; x++) {
      let pixelData = new dynamo.Color(0, 0, 0, 255)
      for(let i = 0; i < colors.length; i++) {
        const t = perlin(x / 255 + i * 0.745, y / 255 + i * 0.745) - (i + 1) * 0.15
        let color = colors[i]
        color.a = dynamo.lerp(0, 255, dynamo.clamp(t, 0, 1))
        pixelData = blend(color, pixelData)
      }
      data.push(pixelData)
    }
  }
  return data
}

/* eslint-disable-next-line no-restricted-globals */
self.addEventListener(
  'message',
  (e) => {
    const { windowDimensions } = e.data
    const nebula = generateNebula(windowDimensions)

    /* eslint-disable-next-line no-restricted-globals */
    self.postMessage({ nebula })
  }
)