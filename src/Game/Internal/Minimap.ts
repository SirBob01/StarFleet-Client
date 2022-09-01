import { AABB, Vec2D, Color, Surface } from 'dynamojs-engine';
import { Camera } from './Camera';

/**
 * Minimap object
 */
class Minimap extends AABB {
  private camera: Camera;

  private playerId: string;

  private windowSize: Vec2D;

  constructor(camera: Camera, playerId: string) {
    const minimapWidth = camera.dimensions.x / 4;
    const minimapHeight = camera.dimensions.y / 3;
    super(
      camera.dimensions.x - minimapWidth / 2,
      camera.dimensions.y - minimapHeight / 2,
      minimapWidth,
      minimapHeight
    );

    this.camera = camera;
    this.playerId = playerId;

    this.windowSize = this.dim.copy();
    this.windowSize.x /= this.camera.worldDimensions.x;
    this.windowSize.y /= this.camera.worldDimensions.y;
  }

  /**
   * Draw the minimap
   *
   * @param display
   * @param entities
   */
  public render(display: Surface, entities: any[]) {
    display.draw_rect(this, new Color(20, 20, 40), true);
    display.draw_rect(this, new Color(100, 100, 100), false, 2);

    // Draw a marker for each entity on the map
    for (const entity of entities) {
      if (entity.class === 'Ship') {
        let color;
        if (entity.owner === this.playerId) {
          color = new Color(0, 255, 0);
        } else {
          color = new Color(255, 0, 0);
        }
        display.draw_circle(
          this.min().add(
            new Vec2D(
              entity.center.x * this.windowSize.x,
              entity.center.y * this.windowSize.y
            )
          ),
          entity.size * this.windowSize.x,
          color,
          true
        );
      }
    }

    // Draw visible screen area
    const visibleArea = new AABB(
      this.camera.position.x * this.windowSize.x,
      this.camera.position.y * this.windowSize.y,
      (this.camera.dimensions.x * this.windowSize.x) / this.camera.currentZoom,
      (this.camera.dimensions.y * this.windowSize.y) / this.camera.currentZoom
    );
    visibleArea.center = visibleArea.center.add(this.min());
    display.draw_rect(visibleArea, new Color(255, 255, 255), false, 1);
  }

  /**
   * Update the minimap
   *
   * @param mousePos
   * @param clicked
   */
  public update(mousePos: Vec2D, clicked: boolean) {
    // Update minimap dimensions to adjust to current screen size
    const minimapWidth = this.camera.dimensions.x / 4;
    const minimapHeight = this.camera.dimensions.y / 3;

    this.center.x = this.camera.dimensions.x - minimapWidth / 2;
    this.center.y = this.camera.dimensions.y - minimapHeight / 2;

    this.dim.x = minimapWidth;
    this.dim.y = minimapHeight;

    // Adjust scaling factor
    this.windowSize = this.dim.copy();
    this.windowSize.x /= this.camera.worldDimensions.x;
    this.windowSize.y /= this.camera.worldDimensions.y;

    // Handle moving the camera using the minimap
    if (this.is_in_bounds(mousePos) && clicked) {
      const relPos = mousePos.sub(this.min());
      this.camera.position.x = relPos.x / this.windowSize.x;
      this.camera.position.y = relPos.y / this.windowSize.y;
      this.camera.clamp();
    }
  }
}

export { Minimap };
