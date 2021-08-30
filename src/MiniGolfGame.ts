import { Force, ViewPort, World, Geometry, SoundPlayer, ToneConfigInput , Body} from '../../worlds/src/index'
import { GolfBall } from './GolfBall';
import { Hole } from './Hole';
import { MiniGolfLevel } from './MiniGolfLevel';
import { ScoreCard } from './ScoreCard';
import { ClickSwingIndicator } from './ClickSwingIndicator';


const { getDistanceBetweenPoints, getHeadingFromPointToPoint } = Geometry

interface TouchRecord {
    body: Body
    startTime: number
    startPoint: { x: number, y: number }
}

const touchMap = new Map<number, TouchRecord>();

interface MiniGolfGameConfig {
    mainCanvas: HTMLCanvasElement
    captionElement: HTMLElement
    messageElement: HTMLElement
    resetButton: HTMLElement
    levels: MiniGolfLevel[]
    soundPlayer?: SoundPlayer
    controlMode?: "CLICK" | "SWIPE"

    controlModeInputs?: {
        clickButton: HTMLInputElement
        swipeButton: HTMLInputElement
    }
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
    controlMode: "CLICK" | "SWIPE"

    controlModeInputs?: {
        clickButton: HTMLInputElement
        swipeButton: HTMLInputElement
    }


    constructor(config: MiniGolfGameConfig) {
        this.config = config;
        this.handleClick = this.handleClick.bind(this)
        this.handleHover = this.handleHover.bind(this)
        this.handleTouchStart = this.handleTouchStart.bind(this)
        this.handleTouchEnd = this.handleTouchEnd.bind(this)

        this.handleBallInHole = this.handleBallInHole.bind(this)
        this.reset = this.reset.bind(this)
        this.playSound = this.playSound.bind(this)
        this.toggleControlMode = this.toggleControlMode.bind(this)

        this.config.resetButton.addEventListener('click', this.reset);
        this.config.mainCanvas.addEventListener('click', this.handleClick);
        this.config.mainCanvas.addEventListener('mousemove', this.handleHover);
        this.config.mainCanvas.addEventListener('pointerdown', this.handleTouchStart);
        this.config.mainCanvas.addEventListener('pointerup', this.handleTouchEnd);

        const scores: number[] = [];
        scores.length = this.config.levels.length;
        scores.fill(0, 0, scores.length);
        this.scoreCard = new ScoreCard(this.config.levels, scores);

        if (config.controlModeInputs) {
            this.controlModeInputs = config.controlModeInputs
            this.initControlModeInputs()
        } else {
            this.controlMode = config.controlMode || "CLICK"
        }

        this.reset();
    }

    get golfBall() { return this.world.bodies.find(body => body.typeId == 'GolfBall') as GolfBall }
    get clickSwingIndicator() { return this.world.effects.find(effect => effect.typeId == 'ClickSwingIndicator') as ClickSwingIndicator }
    get currentLevel() { return this.config.levels[this.levelNumber] }
    get maxPushForce() { return 60 }
    get clickForceMultipler() { return 400 }
    get swipeForceMultipler() { return .5 }

    setUpLevel(level: MiniGolfLevel) {

        if (this.world) {
            this.world.emitter.off("BALL_IN_HOLE", this.handleBallInHole)
            this.world.emitter.off("SFX", this.playSound)
            this.world.stopTime();
        }
        if (this.mainView) { this.mainView.unsetWorld() }

        this.world = level.makeWorld();
        this.world.emitter.on("BALL_IN_HOLE", this.handleBallInHole)
        this.world.emitter.on("SFX", this.playSound)
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

        this.shotsThisRound[this.levelNumber] = 0;
        this.status = "PLAY"
    }

    updateCaptions() {
        const { captionElement } = this.config;

        switch (captionElement && this.status) {
            case "PLAY":
                captionElement.innerText = this.currentLevel ? this.currentLevel.data.name : " ";
                break;
            case "END":
                captionElement.innerText = "Course over!";
                break;
        }

        this.scoreCard.updateAll(this.shotsThisRound);

        if (this.config.messageElement) {
            this.config.messageElement.innerHTML = "";
            this.config.messageElement.appendChild(this.scoreCard.renderTable())
        }
    }


    endOfCourse() {
        console.log('END')
        this.playTone(MiniGolfGame.endOfRoundTone)
        this.clickSwingIndicator.cursorPoint = null
        this.status = "END"
    }

    reset() {
        this.levelNumber = 0
        this.shotsThisRound = [];
        this.setUpLevel(this.currentLevel)
        this.scoreCard.clear();
        this.scoreCard.setCurrentLevel(this.currentLevel)
        this.updateCaptions()
    }


    initControlModeInputs() {
        const { controlModeInputs } = this

        this.controlMode = "CLICK"
        if (controlModeInputs.swipeButton.checked) { this.controlMode = "SWIPE" }

        controlModeInputs.swipeButton.addEventListener('change', this.toggleControlMode)
        controlModeInputs.clickButton.addEventListener('change', this.toggleControlMode)

    }

    toggleControlMode(event: Event) {
        const { clickButton, swipeButton } = this.controlModeInputs

        if (event.target == clickButton) {
            this.controlMode = "CLICK"
        }
        if (event.target == swipeButton) {
            this.controlMode = "SWIPE"
            this.clickSwingIndicator.cursorPoint = null
        }
    }

    goToNextLevel() {
        this.levelNumber++
        if (this.levelNumber >= this.config.levels.length) {
            this.endOfCourse()
        }
        else {
            this.setUpLevel(this.currentLevel);
            this.playTone(MiniGolfGame.nextLevelTone)
            this.scoreCard.setCurrentLevel(this.currentLevel)
        }
        this.updateCaptions()
    }

    handleBallInHole() {
        this.goToNextLevel();
    }

    handleClick(event: PointerEvent) {
        const { maxPushForce, clickForceMultipler, golfBall, status, controlMode } = this;
        if (controlMode !== 'CLICK') { return }

        const worldPoint = this.mainView.locateClick(event, true)
        if (!worldPoint || !golfBall || golfBall.momentum.magnitude > 0 || status !== "PLAY") { return }

        const distance = getDistanceBetweenPoints(golfBall.data, worldPoint) - golfBall.shapeValues.radius
        const magnitude = Math.min(maxPushForce, distance * clickForceMultipler / golfBall.mass)

        const soundVolume = .1 + .9 * (magnitude / maxPushForce)
        this.playSound('click', soundVolume);

        golfBall.momentum = Force.combine([golfBall.momentum, new Force(
            magnitude,
            getHeadingFromPointToPoint(golfBall.shapeValues, worldPoint)
        )]);
        this.shotsThisRound[this.levelNumber]++
        this.updateCaptions()
    }

    handleHover(event: PointerEvent) {
        const { mainView, clickSwingIndicator, maxPushForce, clickForceMultipler, status, controlMode } = this
        if (controlMode !== 'CLICK') { return }

        if (status == 'END') {
            clickSwingIndicator.cursorPoint = null
            return
        }
        const worldPoint = mainView.locateClick(event, true)
        if (!worldPoint) { return }
        clickSwingIndicator.cursorPoint = worldPoint
        clickSwingIndicator.maxPushForce = maxPushForce
        clickSwingIndicator.pushForceDistanceMultipler = clickForceMultipler
    }

    handleTouchStart(event: PointerEvent) {
        const { mainView, controlMode, golfBall } = this
        if (controlMode !== 'SWIPE') { return }

        const startPoint = mainView.locateClick(event, true)
        if (!startPoint) { return }

        touchMap.set(event.pointerId, { body:golfBall, startTime: Date.now(), startPoint })
    }

    handleTouchEnd(event: PointerEvent) {
        const { mainView, maxPushForce, swipeForceMultipler, controlMode, playSound } = this
        if (controlMode !== 'SWIPE') { return }

        const touchRecord = touchMap.get(event.pointerId)

        if (touchRecord) {
            touchMap.delete(event.pointerId)
            const { body, startPoint } = touchRecord;
            const endPoint = mainView.locateClick(event, true)
            if (!endPoint) { return }
    
            const push = Force.fromVector(
                (endPoint.x - startPoint.x) * swipeForceMultipler,
                (endPoint.y - startPoint.y) * swipeForceMultipler
            )
            push.magnitude = Math.min(maxPushForce, push.magnitude)
            body.momentum = push
            const soundVolume = .1 + .9 * (push.magnitude / maxPushForce)
            playSound('click', soundVolume);
        }

    }


    playSound(soundId: string, volume: number = 1) {
        if (this.config.soundPlayer) {
            this.config.soundPlayer.play(soundId, { volume })
        }
    }

    playTone(config: ToneConfigInput | string, label: string = null) {
        if (this.config.soundPlayer) {
            return this.config.soundPlayer.playTone(config, label)
        }
    }

    static get nextLevelTone(): ToneConfigInput {
        return {
            frequency: 300,
            endFrequency: 600,
            type: 'square',
            duration: .75,
        }
    }

    static get endOfRoundTone(): ToneConfigInput {
        return {
            frequency: 400,
            endFrequency: 800,
            duration: 1,
        }
    }
}

export { MiniGolfGame }