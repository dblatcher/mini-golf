import { Body, BodyData, Force, Geometry } from "../../worlds/src";
import { Hole } from "./Hole";

class GolfBall extends Body {
    constructor(config: Geometry.Point, momentum: Force = null) {
        super({
            x:config.x,
            y:config.y,
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

    tick() {
        if (this.momentum.magnitude) {

            if (this.momentum.magnitude < .1) {
                this.momentum.magnitude = 0
                this.world.emitter.emit('BALL_STOP', { golfBall: this });

                const { holeThisIsIn } = this;
                if (holeThisIsIn) {
                    this.world.emitter.emit('BALL_IN_HOLE', { golfBall: this, hole: holeThisIsIn });
                    console.log({ holeThisIsIn })
                }
            }
        }
    }
}


export { GolfBall }