import dynamo from 'dynamojs-engine'

export default class Camera {
  constructor (frameDimensions, worldDimensions) {
    this.worldDimensions = worldDimensions.copy()
    this.dimensions = frameDimensions.copy()

    this.position = new dynamo.Vec2D(0, 0)
    this.target = new dynamo.Vec2D(0, 0)

    this.currentZoom = 1
    this.targetZoom = 1
  }

  setPosition (pos) {
    this.position = pos.copy()
  }

  setTarget (pos) {
    this.target = pos.copy()
  }

  transform (worldBox) {
    const transform = worldBox.copy()
    transform.center = transform.center.sub(this.position).scale(this.currentZoom)
    transform.center = transform.center.add(this.dimensions.scale(0.5))
    transform.dim = transform.dim.scale(this.currentZoom)
    return transform
  }

  transformPoint (worldPoint) {
    let transform = worldPoint.copy()
    transform = transform.sub(this.position).scale(this.currentZoom)
    transform = transform.add(this.dimensions.scale(0.5))
    return transform
  }

  clamp () {
    const min = this.dimensions.scale(1 / (2 * this.currentZoom))
    const max = this.worldDimensions.sub(min)

    if (this.worldDimensions.x * this.currentZoom > this.dimensions.x) {
      this.position.x = dynamo.clamp(this.position.x, min.x, max.x)
    }
    if (this.worldDimensions.y * this.currentZoom > this.dimensions.y) {
      this.position.y = dynamo.clamp(this.position.y, min.y, max.y)
    }
  }

  move (mousePos) {
    const moveThreshold = 25
    if (mousePos.x > this.dimensions.x - moveThreshold) {
      this.position.x += 30
    }
    if (mousePos.y > this.dimensions.y - moveThreshold) {
      this.position.y += 30
    }
    if (mousePos.x < moveThreshold) {
      this.position.x -= 30
    }
    if (mousePos.y < moveThreshold) {
      this.position.y -= 30
    }
  }

  update (dt, dimensions) {
    this.dimensions = dimensions.copy()
    const disp = this.position.sub(this.target)
    const blend = 5.0 * dt / 1000
    const posEps = 0.5
    const zoomEps = 0.005

    if (Math.abs(disp.x) < posEps && Math.abs(disp.y) < posEps) {
      this.position = this.target
    } else {
      this.position = this.position.scale(1 - blend)
      this.position = this.position.add(this.target.scale(blend))
    }

    if (Math.abs(this.targetZoom - this.currentZoom) < zoomEps) {
      this.currentZoom = this.targetZoom
    } else {
      this.currentZoom = dynamo.lerp(this.currentZoom, this.targetZoom, blend)
    }
  }
}
