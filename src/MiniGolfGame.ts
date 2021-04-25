import { Force, ViewPort, World, Geometry, Effect } from '../../worlds/src/index'
import { GolfBall } from './GolfBall';
import { Hole } from './Hole';
import { MiniGolfLevel } from './MiniGolfLevel';
import { SwingIndicator } from './SwingIndicator';

const { getDistanceBetweenPoints, getHeadingFromPointToPoint } = Geometry

interface MiniGolfGameConfig {
    mainCanvas: HTMLCanvasElement
    levels: MiniGolfLevel[]
}

class MiniGolfGame {
    config: MiniGolfGameConfig
    world: World
    mainView: ViewPort
    cursorPoint: Geometry.Point

    constructor(config: MiniGolfGameConfig) {
        this.config = config;
        this.handleClick = this.handleClick.bind(this)
        this.handleHover = this.handleHover.bind(this)
        this.config.mainCanvas.addEventListener('click', this.handleClick);
        this.config.mainCanvas.addEventListener('mousemove', this.handleHover);

        this.setUpLevel(this.config.levels[0]);


    }

    get golfBall() {
        return this.world.bodies.find(body => body.typeId == 'GolfBall') as GolfBall
    }

    get swingIndicator() {
        return this.world.effects.find(effect => effect.typeId == 'SwingIndicator') as SwingIndicator
    }

    get maxPushForce() { return 50 }
    get pushForceDistanceMultipler() { return 200 }

    setUpLevel(level: MiniGolfLevel) {

        if (this.world) { this.world.stopTime() }
        if (this.mainView) {this.mainView.unsetWorld()}

        this.world = level.makeWorld();
        this.mainView = new ViewPort({
            world: this.world,
            height: this.world.height + 100,
            width: this.world.width + 100,
            canvas: this.config.mainCanvas,
            x: this.world.width / 2,
            y: this.world.height / 2,
            framefill: 'rgba(0,0,0,.5)',
            magnify: 1,
        })
        this.world.ticksPerSecond = 50;
    }

    handleClick(event: PointerEvent) {
        const worldPoint = this.mainView.locateClick(event, true)
        const { maxPushForce, pushForceDistanceMultipler } = this;
        if (!worldPoint) { return }

        const distance = getDistanceBetweenPoints(this.golfBall.data, worldPoint) - this.golfBall.shapeValues.radius
        const magnitude = Math.min(maxPushForce, distance * pushForceDistanceMultipler / this.golfBall.mass)

        this.golfBall.momentum = Force.combine([this.golfBall.momentum, new Force(
            magnitude,
            getHeadingFromPointToPoint(this.golfBall.shapeValues, worldPoint)
        )])
    }

    handleHover(event: PointerEvent) {
        const worldPoint = this.mainView.locateClick(event, true)
        if (!worldPoint) { return }
        this.swingIndicator.cursorPoint = worldPoint
    }
}

export { MiniGolfGame }