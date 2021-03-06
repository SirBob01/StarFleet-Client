import dynamo from 'dynamojs-engine'
import Camera from './Camera'
import Minimap from './Minimap'
import SelectBox from './SelectBox'
import Starfield from './Starfield'
import TexturesWorker from './textures.worker'

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

export default class Loading extends dynamo.GameState {
  constructor (socket, startData) {
    super()
    this.socket = socket
    this.startData = startData
  }

  on_entry(core) {
    //@ts-ignore
    const worker = new TexturesWorker()
    const windowDimensions = core.display.rect().dim
    worker.addEventListener('message', e => {
      console.log('Rendering textures!')
      // Render the nebula background
      const nebula = new dynamo.Surface(windowDimensions.x, windowDimensions.y)
      let colorData = nebula.surface.createImageData(windowDimensions.x, windowDimensions.y);
      colorData.data.set(e.data.nebula);
      nebula.surface.putImageData(colorData, 0, 0)

      // Render the planet
      const planet = new dynamo.Surface(600, 600)
      colorData = nebula.surface.createImageData(600, 600);
      colorData.data.set(e.data.planet);
      planet.surface.putImageData(colorData, 0, 0)

      this.set_next(new Main(this.socket, this.startData, { nebula, planet }))
      worker.terminate()
    })
    worker.postMessage({
      windowDimensions
    })
  }

  update(core) {
    core.display.fill(new dynamo.Color(0, 0, 0))
    core.display.draw_text('Loading...', 'Helvetica', 24, new dynamo.Color(255, 255, 255), core.display.rect().dim.scale(0.5))
  }
}

class Main extends dynamo.GameState {
  constructor (socket, startData, textures) {
    super()
    this.socket = socket
    this.textures = textures
    this.sprites = {}

    this.mapSize = new dynamo.Vec2D(startData.mapSize.x, startData.mapSize.y)
    this.entities = []
    this.particles = []
    this.selectBox = null

    // Generate player sprites
    for (const player in startData.pixelData) {
      this.sprites[player] = {
        scout: generateSprite(startData.pixelData[player].scout),
        fighter: generateSprite(startData.pixelData[player].fighter),
        carrier: generateSprite(startData.pixelData[player].carrier)
      }
    }

    this.socket.on('broadcast', data => {
      this.entities = data.entities
    })
  }

  on_entry (core) {
    this.camera = new Camera(core.display.rect().dim, this.mapSize)
    this.minimap = new Minimap(this.camera, this.socket.id)
    this.starfield = new Starfield(this.camera)
  }

  renderGrid (display) {
    const viewport = display.rect().dim
    const min = this.camera.position.sub(viewport.scale(0.5))
    const max = this.camera.position.add(viewport.scale(0.5))
    const gap = 300

    const closestMultiple = (n) => {
      // Find the closest multiple of (gap) from n
      return n - (n % gap)
    }

    for (let y = closestMultiple(min.y); y < max.y; y += gap) {
      const start = this.camera.transformPoint(new dynamo.Vec2D(min.x, y))
      const stop = this.camera.transformPoint(new dynamo.Vec2D(max.x, y))
      const segment = new dynamo.Segment(start, stop)
      display.draw_line(segment, new dynamo.Color(100, 100, 100))
    }
    for (let x = closestMultiple(min.x); x < max.x; x += gap) {
      const start = this.camera.transformPoint(new dynamo.Vec2D(x, min.y))
      const stop = this.camera.transformPoint(new dynamo.Vec2D(x, max.y))
      const segment = new dynamo.Segment(start, stop)
      display.draw_line(segment, new dynamo.Color(100, 100, 100))
    }
  }

  update (core) {
    this.camera.update(core.clock.dt, core.display.rect().dim)
    this.camera.move(core.input.mouse)
    this.camera.clamp()
    this.minimap.update(core.input.mouse, core.input.get_state('Mouse1'))

    core.display.fill(new dynamo.Color(0, 0, 0))
    core.display.draw_surface(this.textures.nebula, core.display.rect())
    core.display.draw_surface(this.textures.planet, new dynamo.AABB(300, 300, 600, 600))
    this.starfield.render(core.display)
    this.renderGrid(core.display)

    // Draw entities
    for (const entity of this.entities) {
      if (entity.class === 'Ship') {
        let color
        if (entity.owner === this.socket.id) {
          color = new dynamo.Color(0, 255, 0)
        } else {
          color = new dynamo.Color(255, 0, 0)
        }
        const transformedCenter = this.camera.transformPoint(new dynamo.Vec2D(entity.center.x, entity.center.y))
        const transformedRect = this.camera.transform(new dynamo.AABB(entity.center.x, entity.center.y, entity.size * 4 / 3, entity.size * 4 / 3))
        core.display.draw_circle(transformedCenter, entity.size * this.camera.currentZoom, color)
        core.display.draw_surface(
          this.sprites[entity.owner][entity.type],
          transformedRect,
          'source-over',
          1.0,
          entity.angle
        )
      }
    }

    // UI elements
    if (core.input.get_pressed('Mouse1')) {
      const worldPos = core.input.mouse.sub(this.camera.dimensions.scale(0.5)).scale(1 / this.camera.currentZoom).add(this.camera.position)
      this.selectBox = new SelectBox(worldPos)
    }

    if (this.selectBox !== null && core.input.get_state('Mouse1')) {
      const worldPos = core.input.mouse.sub(this.camera.dimensions.scale(0.5)).scale(1 / this.camera.currentZoom).add(this.camera.position)
      core.display.draw_rect(this.camera.transform(this.selectBox), new dynamo.Color(0, 255, 0), false, 3, 'source-over', true)
      core.display.draw_rect(this.camera.transform(this.selectBox), new dynamo.Color(0, 255, 0, 30), true, 1, 'source-over', true)

      this.selectBox.update(worldPos)

      for (const entity of this.entities) {
        const aabb = new dynamo.AABB(entity.center.x, entity.center.y, entity.size * 2, entity.size * 2)
        if (aabb.is_colliding(this.selectBox)) {
          core.display.draw_rect(this.camera.transform(aabb), new dynamo.Color(255, 0, 255), false)
        }
      }
    } else {
      this.selectBox = null
    }

    this.minimap.render(core.display, this.entities)
  }
}
