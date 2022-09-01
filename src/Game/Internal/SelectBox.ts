import { AABB, Vec2D } from 'dynamojs-engine';

/**
 * Interactive select box UI
 */
class SelectBox extends AABB {
  private start: Vec2D;

  constructor(startPos: Vec2D) {
    super(startPos.x, startPos.x, 0, 0);
    this.start = startPos.copy();
  }

  /**
   * Update the selectbox position and dimensions
   *
   * @param mousePos
   */
  public update(mousePos: Vec2D) {
    const end = mousePos.copy();
    let left, right;
    if (this.start.x > end.x) {
      left = end.x;
      right = this.start.x;
    } else {
      left = this.start.x;
      right = end.x;
    }

    let top, bottom;
    if (this.start.y > end.y) {
      top = end.y;
      bottom = this.start.y;
    } else {
      top = this.start.y;
      bottom = end.y;
    }

    this.center.x = (left + right) / 2;
    this.center.y = (top + bottom) / 2;
    this.dim.x = right - left;
    this.dim.y = bottom - top;
  }
}

export { SelectBox };
