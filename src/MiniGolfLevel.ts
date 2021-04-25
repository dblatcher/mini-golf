import { Body, Geometry, shapes, World } from "../../worlds/src";
import { GolfBall } from "./GolfBall";
import { Hole } from "./Hole";
import { SwingIndicator } from "./SwingIndicator";


interface Obstacle {
    x: number
    y: number
    size?: number
    heading?: number
    corners?: Geometry.Vector[]
    shape?: 'square' | 'polygon' | 'circle'
}

interface MiniGolfLevelData {
    ball: Geometry.Point
    goal: Geometry.Point
    width: number
    height: number

    obstacles?: Obstacle[]
}

class MiniGolfLevel {
    data: MiniGolfLevelData

    constructor(data: MiniGolfLevelData) {
        this.data = data
        this.data.obstacles = data.obstacles || []
    }

    makeWorld() {

        const { ball, goal, width, height, obstacles } = this.data

        return new World(
            [
                new GolfBall(ball),
                new Hole(goal),
                ...obstacles.map(obstacle => MiniGolfLevel.makeBodyFromObstacle(obstacle))
            ],
            {
                width, height,
                airDensity: .5,
                backGrounds: [],
                hasHardEdges: true,
                effects: [new SwingIndicator()],
                fillColor: 'green',
            }
        )
    }

    static makeBodyFromObstacle(obstacle: Obstacle) {
        const { x, y, size = 10, corners = [], shape = 'square' } = obstacle

        const shapeValue = corners.length > 0 ? shapes.polygon : shapes[shape];

        return new Body({
            x, y, size,
            shape: shapeValue,
            heading: obstacle.heading || 0,
            immobile: true,
            corners,
            fillColor: 'rgba(0,0,0,.75)',
            color: 'rgba(0,0,0,1)',
        })

    }
}

export { MiniGolfLevel }