import { MiniGolfLevel } from "./MiniGolfLevel"

function getRightAngleCorners(width: number = 1) {
    return [
        { x: -width, y: -1 },
        { x: width, y: -1 },
        { x: width, y: 1 },
    ]
}

function getRectangleCorners(width: number = 1) {
    return [
        { x: -width, y: -1 },
        { x: width, y: -1 },
        { x: width, y: 1 },
        { x: -width, y: 1 }
    ]
}

const _deg = (Math.PI * 2) / 360

const levels: MiniGolfLevel[] = [

    new MiniGolfLevel({
        name: 'Tap round',
        par: 2, width: 500, height: 300,
        ball: { x: 50, y: 50 },
        goal: { x: 400, y: 150 },
        obstacles: [
            {
                x: 230, y: 120, size: 60, heading: .1, shape: 'polygon', corners: [
                    { x: -1, y: -1 },
                    { x: 1, y: -1 },
                    { x: 1, y: 0 },
                    { x: .5, y: 0 },
                    { x: .5, y: 1 },
                ]
            },
            { x: 430, y: 220, size: 30, heading: .2, shape: 'square' },
        ],
        bunkers: [
            {x:100, y:250,size:45,heading:45*_deg, shape:'polygon', corners:getRightAngleCorners(.8)}
        ]
    }),

    new MiniGolfLevel({
        name: 'Barn door',
        par: 3, width: 500, height: 300,
        ball: { x: 50, y: 150 },
        goal: { x: 450, y: 150 },
        obstacles: [
            { x: 250, y: 50, size: 50, heading: 0 * _deg, shape: 'polygon', corners: getRectangleCorners(.1) },
            { x: 250, y: 150, size: 50, heading: 0 * _deg, shape: 'polygon', corners: getRectangleCorners(.05), rotate:- .04 },
            { x: 250, y: 250, size: 50, heading: 0 * _deg, shape: 'polygon', corners: getRectangleCorners(.1) },
        ],
    }),

    new MiniGolfLevel({
        name: 'Tunnel',
        par: 3, width: 500, height: 295,
        ball: { x: 50, y: 50 },
        goal: { x: 400, y: 250 },
        obstacles: [
            { x: 230, y: 75, size: 75, heading: 0, shape: 'polygon', corners: getRightAngleCorners() },
            { x: 380, y: 75, size: 75, heading: 90 * _deg, shape: 'polygon', corners: getRightAngleCorners() },
            { x: 230, y: 125, size: 100, heading: 180 * _deg, shape: 'polygon', corners: getRightAngleCorners() },
            { x: 230, y: 260, size: 100, heading: 90 * _deg, shape: 'polygon', corners: getRectangleCorners(.35) },
        ],
    }),

    new MiniGolfLevel({
        name: 'Sand Trap',
        par: 4, width: 500, height: 500,
        ball: { x: 50, y: 100 },
        goal: { x: 450, y: 50 },
        obstacles: [
            { x: 230, y: 160, size: 160, heading: 0, shape: 'polygon', corners: getRectangleCorners(.25) },
            { x: 430, y: 220, size: 30, heading: .2, shape: 'square' },
        ],
        bunkers: [
            { x: 330, y: 340, size: 90, heading: .7, shape: 'circle' },
        ]
    }),

    new MiniGolfLevel({
        name: 'Whirlyjig',
        par: 3, width: 300, height: 500, ball: { x: 70, y: 50 }, goal: { x: 200, y: 440 },
        obstacles: [
            {
                x: 150, y: 250, size: 100, heading: 0, shape: 'polygon', rotate: .02, corners: [
                    { x: -.2, y: -1 },
                    { x: .2, y: -1 },
                    { x: .2, y: -.2 },
                    { x: 1, y: -.2 },
                    { x: 1, y: .2 },
                    { x: .2, y: .2 },
                    { x: .2, y: 1 },
                    { x: -.2, y: 1 },
                ]
            },
        ]
    }),



]

export { levels }