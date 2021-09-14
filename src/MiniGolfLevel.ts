import { Area, Body, Geometry, shapes, World } from "../../worlds/src";
import { GolfBall } from "./GolfBall";
import { Hole } from "./Hole";
import { ClickSwingIndicator } from "./ClickSwingIndicator";
import { SwipeSwingIndicator } from "./SwipeSwingIndicator";
import { constants } from "./constants";


interface Obstacle {
    x: number
    y: number
    size?: number
    heading?: number
    corners?: Geometry.Vector[]
    rotate?: number
    shape?: 'square' | 'polygon' | 'circle'
}

interface Bunker {
    x: number
    y: number
    size?: number
    heading?: number
    corners?: Geometry.Vector[]
    shape?: 'square' | 'polygon' | 'circle'
}



interface MiniGolfLevelData {
    name?: string
    par: number
    ball: Geometry.Point
    goal: Geometry.Point
    width: number
    height: number

    obstacles?: Obstacle[]
    bunkers?: Bunker[]
}

class MiniGolfLevel {
    data: MiniGolfLevelData

    constructor(data: MiniGolfLevelData) {
        this.data = data
        this.data.obstacles = data.obstacles || []
        this.data.bunkers = data.bunkers || []
    }

    makeWorld() {

        const { ball, goal, width, height, obstacles, bunkers } = this.data

        return new World(
            [
                new GolfBall(ball),
                new Hole(goal),
                ...obstacles.map(obstacle => MiniGolfLevel.makeBodyFromObstacle(obstacle)),
                ...bunkers.map(bunker => MiniGolfLevel.makeAreaFromBunker(bunker)),
            ],
            {
                width, height,
                airDensity: constants.GROUND_DRAG,
                backGrounds: [],
                hasHardEdges: true,
                effects: [new ClickSwingIndicator(), new SwipeSwingIndicator()],
                fillColor: 'green',
            }
        )
    }

    static makeBodyFromObstacle(obstacle: Obstacle) {
        const { x, y, size = 10, corners = [], shape = 'square' } = obstacle

        const shapeValue = corners.length > 0 ? shapes.polygon : shapes[shape];

        const body = new Body({
            x, y, size,
            shape: shapeValue,
            heading: obstacle.heading || 0,
            immobile: true,
            corners,
            fillColor: 'rgba(0,0,0,.75)',
            color: 'rgba(0,0,0,1)',
        })

        if (obstacle.rotate) {
            body.tick = () => {
                body.data.heading += obstacle.rotate * constants.ROTATE_RATE
            }
        }

        return body;
    }

    static makeAreaFromBunker(bunker: Bunker) {
        const { x, y, size = 10, corners = [], shape = 'square' } = bunker

        const shapeValue = corners.length > 0 ? shapes.polygon : shapes[shape];

        const area = new Area({
            x, y, size,
            shape: shapeValue,
            density: constants.GROUND_DRAG*5,
            heading: bunker.heading || 0,
            corners,
            fillColor: 'rgba(200,150,50,1)',
            color: 'rgba(0,0,0,1)',
        })

        return area;
    }
}

export { MiniGolfLevel }