import { Area, AreaData, Geometry } from "../../worlds/src";

class Hole extends Area {

    constructor(config: Geometry.Point) {
        super({
            x: config.x,
            y: config.y,
            color: 'black',
            fillColor: 'black',
            size: 12,
            density: .5
        })
    }

    get typeId() { return "Hole" }
}


export { Hole }