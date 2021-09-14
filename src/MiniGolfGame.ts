import { Force, ViewPort, World, Geometry, SoundPlayer, ToneConfigInput, Body } from '../../worlds/src/index'
import { GolfBall } from './GolfBall';
import { Hole } from './Hole';
import { MiniGolfLevel } from './MiniGolfLevel';
import { ScoreCard } from './ScoreCard';
import { ClickSwingIndicator } from './ClickSwingIndicator';
import { SwipeSwingIndicator } from './SwipeSwingIndicator';
import { constants } from './constants';


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
        this.config.mainCanvas.addEventListener('pointermove', this.handleHover);
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
    get swipeSwingIndicator() { return this.world.effects.find(effect => effect.typeId == 'SwipeSwingIndicator') as SwipeSwingIndicator }
    get currentLevel() { return this.config.levels[this.levelNumber] }
    get maxPushForce() { return constants.MAX_PUSH_FORCE }
    get clickForceMultipler() { return 300 }
    get swipeForceMultipler() { return .1 }

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
        this.world.ticksPerSecond = constants.WORLD_SPEED;

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
            this.swipeSwingIndicator.cursorPoint = null
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

    pushBall(push: Force) {
        const { maxPushForce, golfBall } = this;
        const soundVolume = .1 + .9 * (push.magnitude / maxPushForce)
        this.playSound('click', soundVolume);

        golfBall.momentum = Force.combine([golfBall.momentum, push]);
        this.shotsThisRound[this.levelNumber]++
        this.updateCaptions()
    }

    handleClick(event: PointerEvent) {
        const { maxPushForce, clickForceMultipler, golfBall, status, controlMode } = this;
        if (controlMode !== 'CLICK') { return }

        const worldPoint = this.mainView.locateClick(event, true)
        if (!worldPoint || !golfBall || golfBall.momentum.magnitude > 0 || status !== "PLAY") { return }

        const distance = getDistanceBetweenPoints(golfBall.data, worldPoint) - golfBall.shapeValues.radius
        const magnitude = Math.min(maxPushForce, distance * clickForceMultipler / golfBall.mass)

        const push = new Force(
            magnitude,
            getHeadingFromPointToPoint(golfBall.data, worldPoint)
        )
        this.pushBall(push)
    }

    handleHover(event: PointerEvent) {
        const { mainView, clickSwingIndicator, swipeSwingIndicator, maxPushForce, clickForceMultipler, status, controlMode } = this

        if (status == 'END') {
            clickSwingIndicator.cursorPoint = null
            return
        }
        const worldPoint = mainView.locateClick(event, true)

        if (!worldPoint) { return }

        if (controlMode === 'CLICK') {
            clickSwingIndicator.cursorPoint = worldPoint
            clickSwingIndicator.maxPushForce = maxPushForce
            clickSwingIndicator.pushForceDistanceMultipler = clickForceMultipler
            swipeSwingIndicator.cursorPoint = null

        } else if (controlMode === 'SWIPE') {

            if (touchMap.size > 0) {
                const firstRecord = touchMap.values().next().value as TouchRecord
                swipeSwingIndicator.cursorPoint = worldPoint
                swipeSwingIndicator.swipeStartPoint = firstRecord.startPoint
                swipeSwingIndicator.maxPushForce = maxPushForce
                swipeSwingIndicator.pushForceDistanceMultipler = clickForceMultipler
            } else {
                swipeSwingIndicator.cursorPoint = null
            }

            clickSwingIndicator.cursorPoint = null
        }
    }

    handleTouchStart(event: PointerEvent) {
        const { mainView, controlMode, golfBall } = this
        if (controlMode !== 'SWIPE') { return }

        const startPoint = mainView.locateClick(event, true)
        if (!startPoint) { return }

        touchMap.set(event.pointerId, { body: golfBall, startTime: Date.now(), startPoint })
    }

    handleTouchEnd(event: PointerEvent) {
        const { mainView, maxPushForce, swipeForceMultipler, controlMode, golfBall, status } = this
        if (controlMode !== 'SWIPE') { return }
        this.swipeSwingIndicator.cursorPoint = null
        if (!golfBall || golfBall.momentum.magnitude > 0 || status !== "PLAY") { return }

        const touchRecord = touchMap.get(event.pointerId)

        if (touchRecord) {
            touchMap.clear()
            const { startPoint } = touchRecord;
            const endPoint = mainView.locateClick(event, true)
            if (!endPoint) { return }

            const push = Force.fromVector(
                (endPoint.x - startPoint.x) * swipeForceMultipler,
                (endPoint.y - startPoint.y) * swipeForceMultipler
            )
            push.magnitude = Math.min(maxPushForce, push.magnitude)
            this.pushBall(push);
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