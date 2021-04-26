import { Effect, Force, Geometry, RenderFunctions, ViewPort } from "../../worlds/src";
import { getDistanceBetweenPoints, getHeadingFromPointToPoint, translatePoint } from "../../worlds/src/geometry";
import { GolfBall } from "./GolfBall";


class SwingIndicator extends Effect {
    cursorPoint: Geometry.Point
    maxPushForce: number
    pushForceDistanceMultipler: number


    constructor() {
        super({ x: 0, y: 0, frame: 0, duration: Infinity });
    }

    get typeId() { return "SwingIndicator" }

    get golfBall() {
        return this.world.bodies.find(body => body.typeId == 'GolfBall') as GolfBall
    }


    get maxLineDistance() {
        const { golfBall, maxPushForce, pushForceDistanceMultipler } = this
        if (!golfBall || !maxPushForce || !pushForceDistanceMultipler) { return 0 }
        return (maxPushForce * golfBall.mass) / pushForceDistanceMultipler
    }

    renderOnCanvas(ctx: CanvasRenderingContext2D, viewPort: ViewPort) {

        const { cursorPoint, golfBall, maxLineDistance } = this;
        if (!cursorPoint || !golfBall) { return }
        if (golfBall.momentum.magnitude > 0) { return }

        const distance = getDistanceBetweenPoints(golfBall.data, cursorPoint)
        const lineForce = new Force(distance, getHeadingFromPointToPoint(cursorPoint, golfBall.data));
        lineForce.magnitude = Math.min(lineForce.magnitude, maxLineDistance);

        const plotPoint = translatePoint(golfBall.data, lineForce.vector);

        const style = {
            strokeColor: "white",
            lineDash: [2, 3],
            lineWidth: 3,
        }

        RenderFunctions.renderCircle.onCanvas(ctx, {
            x: golfBall.data.x,
            y: golfBall.data.y,
            radius: golfBall.data.size + 5
        }, style, viewPort)

        RenderFunctions.renderLine.onCanvas(ctx, [golfBall.data, plotPoint], style, viewPort)
    }

    tick() { }
}

export { SwingIndicator }