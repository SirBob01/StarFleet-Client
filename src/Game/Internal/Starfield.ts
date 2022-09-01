import { Color, Surface, Vec2D, randrange } from 'dynamojs-engine';
import { Camera } from './Camera';

/**
 * List of all possible star colors
 */
const starColors = [
  new Color(240, 240, 240), // white
  new Color(240, 240, 200), // yellow
  new Color(200, 200, 240), // blue
  new Color(240, 200, 200), // red
];

/**
 * Indiviudal star
 */
interface Star {
  /**
   * World position of the star
   */
  pos: Vec2D;

  /**
   * On-screen radius of the star
   */
  size: number;

  /**
   * Star color
   */
  color: Color;
}

/**
 * Parallax starfield background effect
 */
class Starfield {
  private stars: Star[];

  private camera: Camera;

  constructor(camera: Camera) {
    this.stars = [];
    this.camera = camera;

    // Generate the starfield
    // Density depends on the size of the camera
    for (let i = 0; i < this.camera.dimensions.x; i++) {
      this.stars.push({
        pos: new Vec2D(
          randrange(-this.camera.dimensions.x, this.camera.dimensions.x * 2),
          randrange(-this.camera.dimensions.y, this.camera.dimensions.y * 2)
        ),
        size: randrange(0.5, 1.5),
        color: starColors[Math.floor(randrange(0, starColors.length))],
      });
    }
  }

  /**
   * Draw the starfield
   *
   * @param display
   */
  public render(display: Surface) {
    for (const star of this.stars) {
      const offset = new Vec2D(
        this.camera.position.x / this.camera.worldDimensions.x,
        this.camera.position.y / this.camera.worldDimensions.y
      ).scale(-star.size * 30);
      display.draw_circle(star.pos.add(offset), star.size, star.color, true);
    }
  }
}

export { Starfield };
