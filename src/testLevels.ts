import { MiniGolfLevel } from "./MiniGolfLevel"

const { getRightAngleCorners, _deg } = MiniGolfLevel

const testLevels: MiniGolfLevel[] = [

    new MiniGolfLevel({
        name: 'Test one',
        par: 2, width: 500, height: 300,
        ball: { x: 50, y: 50 },
        goal: { x: 400, y: 150 },
        obstacles: [
            {
                x: 130, y: 220, size: 60, heading: .1, shape: 'square', rotate: .01,
            },
            { x: 430, y: 220, size: 30, heading: .2, shape: 'circle' },
        ],
        bunkers: [
            { x: 400, y: 50, size: 45, heading: 45 * _deg, shape: 'polygon', corners: getRightAngleCorners(.4) }
        ]
    }),

]

export { testLevels }