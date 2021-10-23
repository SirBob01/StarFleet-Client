import dynamo from 'dynamojs-engine'

export default class Minimap extends dynamo.AABB {
  constructor (camera, playerId) {
    const minimapWidth = camera.dimensions.x / 4
    const minimapHeight = camera.dimensions.y / 3
    super(camera.dimensions.x - minimapWidth / 2, camera.dimensions.y - minimapHeight / 2, minimapWidth, minimapHeight)

    this.camera = camera
    this.playerId = playerId

    this.o = this.dim.copy()
    this.o.x /= this.camera.worldDimensions.x
    this.o.y /= this.camera.worldDimensions.y
  }

  render (display, entities) {
    display.draw_rect(this, new dynamo.Color(20, 20, 40), true)
    display.draw_rect(this, new dynamo.Color(100, 100, 100), false, 2)

    // Draw a marker for each entity on the map
    for (const entity of entities) {
      if (entity.class === 'Ship') {
        let color
        if (entity.owner === this.playerId) {
          color = new dynamo.Color(0, 255, 0)
        } else {
          color = new dynamo.Color(255, 0, 0)
        }
        display.draw_circle(
          this.min().add(new dynamo.Vec2D(entity.center.x * this.o.x, entity.center.y * this.o.y)),
          entity.size * this.o.x,
          color,
          true
        )
      }
    }

    // Draw visible screen area
    const visibleArea = new dynamo.AABB(
      this.camera.position.x * this.o.x,
      this.camera.position.y * this.o.y,
      this.camera.dimensions.x * this.o.x,
      this.camera.dimensions.y * this.o.y
    )
    visibleArea.center = visibleArea.center.add(this.min())
    display.draw_rect(visibleArea, new dynamo.Color(255, 255, 255), false, 1)
  }

  update (mouse, clicked) {
    // Update minimap dimensions to adjust to current screen size
    const minimapWidth = this.camera.dimensions.x / 4
    const minimapHeight = this.camera.dimensions.y / 3

    this.center.x = this.camera.dimensions.x - minimapWidth / 2
    this.center.y = this.camera.dimensions.y - minimapHeight / 2

    this.dim.x = minimapWidth
    this.dim.y = minimapHeight

    this.o = this.dim.copy()
    this.o.x /= this.camera.worldDimensions.x
    this.o.y /= this.camera.worldDimensions.y

    if (this.is_in_bounds(mouse) && clicked) {
      const relPos = mouse.sub(this.min())
      this.camera.position.x = relPos.x / this.o.x
      this.camera.position.y = relPos.y / this.o.y
      this.camera.clamp()
    }
  }
}
