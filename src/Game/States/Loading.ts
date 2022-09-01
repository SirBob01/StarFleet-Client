import { Color, Core, GameState, Surface } from 'dynamojs-engine';
import { Socket } from 'socket.io-client';
import { Main } from './Main';
import TexturesWorker from './textures.worker';

class Loading extends GameState {
  socket: Socket;

  startData: any;

  constructor(socket: Socket, startData: any) {
    super();
    this.socket = socket;
    this.startData = startData;
  }

  on_entry(core: Core) {
    const worker = new TexturesWorker();
    const windowDimensions = core.display.rect().dim;
    worker.addEventListener('message', (e) => {
      console.log('Rendering textures...');
      // Render the nebula background
      const nebula = new Surface(windowDimensions.x, windowDimensions.y);
      let colorData = nebula.surface.createImageData(
        windowDimensions.x,
        windowDimensions.y
      );
      colorData.data.set(e.data.nebula);
      nebula.surface.putImageData(colorData, 0, 0);

      // Render the planet
      const planet = new Surface(600, 600);
      colorData = nebula.surface.createImageData(600, 600);
      colorData.data.set(e.data.planet);
      planet.surface.putImageData(colorData, 0, 0);

      this.set_next(new Main(this.socket, this.startData, { nebula, planet }));
      worker.terminate();
    });
    worker.postMessage({
      windowDimensions,
    });
  }

  update(core: Core) {
    core.display.fill(new Color(0, 0, 0));
    core.display.draw_text(
      'Loading...',
      'Helvetica',
      24,
      new Color(255, 255, 255),
      core.display.rect().dim.scale(0.5)
    );
  }
}

export { Loading };
