import { Body, Force, Geometry, CollisionDetection } from "../../worlds/src";
import { Hole } from "./Hole";

class GolfBall extends Body {
    constructor(config: Geometry.Point, momentum: Force = null) {
        super({
            x: config.x,
            y: config.y,
            fillColor: 'white',
            color: 'black',
            size: 5,
        }, momentum);

    }

    get typeId() { return 'GolfBall' }

    get holeThisIsIn(): Hole {
        if (!this.world) { return null }
        return this.world.areas
            .filter(area => area.typeId == 'Hole')
            .find(hole => hole.checkIfContainsPoint(this.data)) as Hole || null
    }

    get tapVolume() {
        return .1 + .9 * (Math.min(this.momentum.magnitude / 50, 1))
    }

    handleCollision(report: CollisionDetection.CollisionReport) {
        Body.prototype.handleCollision.apply(this, [report]);
        if (report.force > 0) {
            this.world.emitter.emit('SFX', 'tap', this.tapVolume);
        }
    }

    handleWorldEdgeCollision(report: CollisionDetection.EdgeCollisionReport) {
        Body.prototype.handleWorldEdgeCollision.apply(this, [report]);
        this.world.emitter.emit('SFX', 'tap', this.tapVolume);
    }

    tick() {
        if (this.momentum.magnitude) {
            const { holeThisIsIn } = this;

            if (holeThisIsIn) {
                this.momentum.magnitude *= .75
            }

            if (this.momentum.magnitude < .1) {
                this.momentum.magnitude = 0
                this.world.emitter.emit('BALL_STOP', { golfBall: this });

                if (holeThisIsIn) {
                    this.world.emitter.emit('BALL_IN_HOLE', { golfBall: this, hole: holeThisIsIn });
                }
            }
        }
    }
}


export { GolfBall }