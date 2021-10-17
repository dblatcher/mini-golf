import { Area, AreaData, Geometry } from "physics-worlds";
import { constants } from "./constants";

class Hole extends Area {

    constructor(config: Geometry.Point) {
        super({
            x: config.x,
            y: config.y,
            color: 'black',
            fillColor: 'black',
            size: constants.HOLE_SIZE,
            density: constants.GROUND_DRAG*2
        })
    }

    get typeId() { return "Hole" }
}


export { Hole }