import { Force, Geometry, RenderFunctions, ViewPort } from "physics-worlds";
import { ClickSwingIndicator } from "./ClickSwingIndicator";

const { getDistanceBetweenPoints, getHeadingFromPointToPoint, translatePoint, _deg } = Geometry;

class SwipeSwingIndicator extends ClickSwingIndicator {

    swipeStartPoint: Geometry.Point

    get typeId() { return "SwipeSwingIndicator" }

    renderOnCanvas(ctx: CanvasRenderingContext2D, viewPort: ViewPort) {

        const { cursorPoint, golfBall, maxLineDistance, swipeStartPoint } = this;
        if (!cursorPoint || !golfBall || !swipeStartPoint) { return }
        if (golfBall.momentum.magnitude > 0) { return }

        const distance = getDistanceBetweenPoints(swipeStartPoint, cursorPoint)
        const lineForce = new Force(distance, getHeadingFromPointToPoint(cursorPoint, swipeStartPoint));
        lineForce.magnitude = Math.min(lineForce.magnitude, maxLineDistance);

        const endPoint = translatePoint(golfBall.data, lineForce.vector);

        const style = {
            strokeColor: "red",
            lineWidth: 2,
        }

        RenderFunctions.renderLine.onCanvas(ctx, [golfBall.data, endPoint], style, viewPort)

        const arrowLeft = new Force(8, lineForce.direction + _deg * 150)
        const arrowRight = new Force(8, lineForce.direction - _deg * 150)
        RenderFunctions.renderLine.onCanvas(ctx, [endPoint, translatePoint(endPoint, arrowLeft.vector)], style, viewPort)
        RenderFunctions.renderLine.onCanvas(ctx, [endPoint, translatePoint(endPoint, arrowRight.vector)], style, viewPort)
    }

    tick() { }
}

export { SwipeSwingIndicator }