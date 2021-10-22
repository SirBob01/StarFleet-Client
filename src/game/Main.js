import dynamo from 'dynamojs-engine'

function generateSprite (colorData) {
  const pixelSize = 32
  const surface = new dynamo.Surface(colorData.size * pixelSize, colorData.size * pixelSize)
  for (let x = 0; x < colorData.size; x++) {
    for (let y = 0; y < colorData.size; y++) {
      const color = colorData.buffer[y * colorData.size + x]
      surface.draw_rect(
        new dynamo.AABB(x * pixelSize, y * pixelSize, pixelSize, pixelSize),
        new dynamo.Color(color.r, color.g, color.b, color.a * 255),
        true, 1, 'source-over', false)
    }
  }
  return surface
}

class Main extends dynamo.GameState {
  constructor (socket, startData) {
    super()
    this.socket = socket
    this.sprites = {}
    this.angle = 0

    // Generate player sprites
    for (const player in startData.pixelData) {
      this.sprites[player] = {
        scout: generateSprite(startData.pixelData[player].scout),
        fighter: generateSprite(startData.pixelData[player].fighter),
        carrier: generateSprite(startData.pixelData[player].carrier)
      }
    }

    this.socket.on('broadcast', data => {
      
    })
  }

  update (core) {
    core.display.fill(new dynamo.Color(0, 0, 0))
  }
}

export default Main
