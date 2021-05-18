import { Force, ViewPort, World, Geometry, Effect } from '../../worlds/src/index'
import { GolfBall } from './GolfBall';
import { Hole } from './Hole';
import { MiniGolfLevel } from './MiniGolfLevel';
import { ScoreCard } from './ScoreCard';
import { SwingIndicator } from './SwingIndicator';


const { getDistanceBetweenPoints, getHeadingFromPointToPoint } = Geometry



interface MiniGolfGameConfig {
    mainCanvas: HTMLCanvasElement
    scoreLabel: HTMLElement
    messageElement: HTMLElement
    resetButton: HTMLElement
    levels: MiniGolfLevel[]
}

class MiniGolfGame {
    config: MiniGolfGameConfig
    world: World
    mainView: ViewPort
    scoreCard: ScoreCard
    cursorPoint: Geometry.Point
    levelNumber: number
    shotsThisRound: number[]
    status: "PLAY" | "END"

    constructor(config: MiniGolfGameConfig) {
        this.config = config;
        this.handleClick = this.handleClick.bind(this)
        this.handleHover = this.handleHover.bind(this)
        this.handleBallInHole = this.handleBallInHole.bind(this)
        this.reset = this.reset.bind(this)
        this.config.resetButton.addEventListener('click', this.reset);
        this.config.mainCanvas.addEventListener('click', this.handleClick);
        this.config.mainCanvas.addEventListener('mousemove', this.handleHover);

        const scores: number[] = [];
        scores.length = this.config.levels.length;
        scores.fill(0, 0, scores.length);
        this.scoreCard = new ScoreCard(this.config.levels, scores);

        this.reset();
    }

    get golfBall() { return this.world.bodies.find(body => body.typeId == 'GolfBall') as GolfBall }
    get swingIndicator() { return this.world.effects.find(effect => effect.typeId == 'SwingIndicator') as SwingIndicator }
    get currentLevel() { return this.config.levels[this.levelNumber] }
    get maxPushForce() { return 60 }
    get pushForceDistanceMultipler() { return 400 }

    setUpLevel(level: MiniGolfLevel) {

        if (this.world) {
            this.world.emitter.off("BALL_IN_HOLE", this.handleBallInHole)
            this.world.stopTime();
        }
        if (this.mainView) { this.mainView.unsetWorld() }

        this.world = level.makeWorld();
        this.world.emitter.on("BALL_IN_HOLE", this.handleBallInHole)
        this.mainView = new ViewPort({
            world: this.world,
            height: this.world.height + 125,
            width: this.world.width + 125,
            canvas: this.config.mainCanvas,
            x: this.world.width / 2,
            y: this.world.height / 2,
            framefill: 'rgba(0,0,0,.5)',
            magnify: 1,
        })
        this.world.ticksPerSecond = 50;

        this.scoreCard.setCurrentLevel(this.currentLevel)
        this.shotsThisRound[this.levelNumber] = 0;
        this.updateCaptions();
        this.status = "PLAY"
    }

    updateCaptions() {
        const { scoreLabel } = this.config;
        if (!scoreLabel) { return }

        scoreLabel.innerText = this.currentLevel ? `${this.shotsThisRound[this.levelNumber]} shots / ${this.currentLevel.data.par}.` : '';

        this.scoreCard.updateAll(this.shotsThisRound);

        if (this.config.messageElement) {
            this.config.messageElement.innerHTML = "";
            this.config.messageElement.appendChild(this.scoreCard.renderTable())
        }
    }


    endOfCourse() {
        console.log('END')
        this.swingIndicator.cursorPoint = null
        this.status = "END"
    }

    reset() {
        this.levelNumber = 0
        this.shotsThisRound = [];
        this.setUpLevel(this.currentLevel)
    }

    goToNextLevel() {
        this.levelNumber++
        this.updateCaptions()
        if (this.levelNumber >= this.config.levels.length) { return this.endOfCourse() }
        this.setUpLevel(this.config.levels[this.levelNumber]);
    }

    handleBallInHole() {
        this.goToNextLevel();
    }

    handleClick(event: PointerEvent) {
        const worldPoint = this.mainView.locateClick(event, true)
        const { maxPushForce, pushForceDistanceMultipler, golfBall, status } = this;
        if (!worldPoint || !golfBall || golfBall.momentum.magnitude > 0 || status !== "PLAY") { return }

        const distance = getDistanceBetweenPoints(golfBall.data, worldPoint) - golfBall.shapeValues.radius
        const magnitude = Math.min(maxPushForce, distance * pushForceDistanceMultipler / golfBall.mass)

        golfBall.momentum = Force.combine([golfBall.momentum, new Force(
            magnitude,
            getHeadingFromPointToPoint(golfBall.shapeValues, worldPoint)
        )]);
        this.shotsThisRound[this.levelNumber]++
        this.updateCaptions()
    }

    handleHover(event: PointerEvent) {
        const { mainView, swingIndicator, maxPushForce, pushForceDistanceMultipler, status } = this
        if (status == 'END') {
            swingIndicator.cursorPoint = null
            return
        }
        const worldPoint = mainView.locateClick(event, true)
        if (!worldPoint) { return }
        swingIndicator.cursorPoint = worldPoint
        swingIndicator.maxPushForce = maxPushForce
        swingIndicator.pushForceDistanceMultipler = pushForceDistanceMultipler
    }
}

export { MiniGolfGame }