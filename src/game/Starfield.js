import dynamo from 'dynamojs-engine'

const starColors = [
  new dynamo.Color(240, 240, 240), // white
  new dynamo.Color(240, 240, 200), // yellow
  new dynamo.Color(200, 200, 240), // blue
  new dynamo.Color(240, 200, 200) // red
]

export default class Starfield {
  constructor (camera) {
    this.stars = []
    this.camera = camera

    for (let i = 0; i < this.camera.dimensions.x; i++) {
      this.stars.push({
        pos: new dynamo.Vec2D(
          dynamo.randrange(-this.camera.dimensions.x, this.camera.dimensions.x * 2),
          dynamo.randrange(-this.camera.dimensions.y, this.camera.dimensions.y * 2)
        ),
        size: dynamo.randrange(0.5, 1.5),
        color: starColors[Math.floor(dynamo.randrange(0, starColors.length))]
      })
    }
  }

  render (display) {
    for (const star of this.stars) {
      const offset = new dynamo.Vec2D(
        this.camera.position.x / this.camera.worldDimensions.x,
        this.camera.position.y / this.camera.worldDimensions.y
      ).scale(-star.size * 30)
      display.draw_circle(star.pos.add(offset), star.size, star.color, true)
    }
  }
}
