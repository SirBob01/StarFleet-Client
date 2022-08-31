import { Vec2D, AABB, clamp, lerp } from 'dynamojs-engine';

/**
 * Camera class
 */
class Camera {
  private target: Vec2D;

  private targetZoom: number;

  worldDimensions: Vec2D;

  dimensions: Vec2D;

  position: Vec2D;

  currentZoom: number;

  constructor(frameDimensions: Vec2D, worldDimensions: Vec2D) {
    this.worldDimensions = worldDimensions.copy();
    this.dimensions = frameDimensions.copy();

    this.position = new Vec2D(0, 0);
    this.target = new Vec2D(0, 0);

    this.currentZoom = 1;
    this.targetZoom = 1;
  }

  /**
   * Set the current position of the camera
   *
   * @param pos
   */
  public setPosition(pos: Vec2D) {
    this.position = pos.copy();
  }

  /**
   * Set the target position for the camera to smoothly fly to it
   *
   * @param pos
   */
  public setTarget(pos: Vec2D) {
    this.target = pos.copy();
  }

  /**
   * Transform a bounding volume in world space to camera space
   *
   * @param worldBox
   * @returns
   */
  public transform(worldBox: AABB) {
    const transform = worldBox.copy();
    transform.center = transform.center
      .sub(this.position)
      .scale(this.currentZoom);
    transform.center = transform.center.add(this.dimensions.scale(0.5));
    transform.dim = transform.dim.scale(this.currentZoom);
    return transform;
  }

  /**
   * Transform the world point to camera space
   *
   * @param worldPoint
   * @returns
   */
  public transformPoint(worldPoint: Vec2D) {
    let transform = worldPoint.copy();
    transform = transform.sub(this.position).scale(this.currentZoom);
    transform = transform.add(this.dimensions.scale(0.5));
    return transform;
  }

  /**
   * Clamp the camera bounds to the world bounds
   */
  public clamp() {
    const min = this.dimensions.scale(1 / (2 * this.currentZoom));
    const max = this.worldDimensions.sub(min);

    if (this.worldDimensions.x * this.currentZoom > this.dimensions.x) {
      this.position.x = clamp(this.position.x, min.x, max.x);
    }
    if (this.worldDimensions.y * this.currentZoom > this.dimensions.y) {
      this.position.y = clamp(this.position.y, min.y, max.y);
    }
  }

  /**
   * Move the camera when the mouse is pushing against the side of the screen
   *
   * @param mousePos
   */
  public move(mousePos: Vec2D) {
    const moveThreshold = 25;
    if (mousePos.x > this.dimensions.x - moveThreshold) {
      this.position.x += 30;
    }
    if (mousePos.y > this.dimensions.y - moveThreshold) {
      this.position.y += 30;
    }
    if (mousePos.x < moveThreshold) {
      this.position.x -= 30;
    }
    if (mousePos.y < moveThreshold) {
      this.position.y -= 30;
    }
  }

  /**
   * Update the camera
   *
   * @param dt (ms)
   * @param dimensions
   */
  public update(dt: number, dimensions: Vec2D) {
    this.dimensions = dimensions.copy();
    const disp = this.position.sub(this.target);
    const blend = (5.0 * dt) / 1000;
    const posEps = 0.5;
    const zoomEps = 0.005;

    if (Math.abs(disp.x) < posEps && Math.abs(disp.y) < posEps) {
      this.position = this.target;
    } else {
      this.position = this.position.scale(1 - blend);
      this.position = this.position.add(this.target.scale(blend));
    }

    if (Math.abs(this.targetZoom - this.currentZoom) < zoomEps) {
      this.currentZoom = this.targetZoom;
    } else {
      this.currentZoom = lerp(this.currentZoom, this.targetZoom, blend);
    }
  }
}

export { Camera };
