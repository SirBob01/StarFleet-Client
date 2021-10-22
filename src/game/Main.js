import dynamo from 'dynamojs-engine'

class Main extends dynamo.GameState {
    constructor(socket, startData) {
        super()
        this.socket = socket
        this.pixelData = startData.pixelData
        console.log(startData)
    }

    update(core) {
        core.display.fill(new dynamo.Color(0, 0, 30))
    }
}

export default Main