import { MiniGolfLevel } from "./MiniGolfLevel"

const { getRightAngleCorners, _deg, getRectangleCorners, getIsoscelesCorners } = MiniGolfLevel

const squareCage = [
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
    { x: -1, y: .9 },
    { x: .9, y: .9 },
    { x: .9, y: -.9 },
    { x: -1, y: -.9 },
]

const harderLevels: MiniGolfLevel[] = [

    new MiniGolfLevel({
        name: "Corner",
        width: 400,
        height: 300,
        par: 3,
        goal: { x: 350, y: 50 },
        ball: { x: 50, y: 275 },
        obstacles: [
            { x: 300, y: 200, size: 100, shape: 'square' },
            { x: 150, y: 200, size: 100, shape: 'polygon', corners: getRectangleCorners(.5) },
            { x: 50, y: 175, size: 40, shape: 'polygon', corners: getIsoscelesCorners(.5) },
            { x: 250, y: 25, size: 40, heading: _deg*80, shape: 'polygon', corners: getRectangleCorners(.2) },
            { x: 250, y: 75, size: 40, heading: _deg*100, shape: 'polygon', corners: getRectangleCorners(.2) },
        ],
        bunkers: [

        ]
    }),

    new MiniGolfLevel({
        name: "Balancing Act",
        width: 400,
        height: 300,
        par: 4,
        goal: { x: 100, y: 50 },
        ball: { x: 50, y: 255 },
        obstacles: [
            { x: 175, y: 105, size: 175, heading: 90 * _deg, shape: 'polygon', corners: getRectangleCorners(.1) }
        ],
        bunkers: [
            { x: 150, y: 225, size: 150, heading: -90 * _deg, shape: 'polygon', corners: getRightAngleCorners(.5) },
            { x: 150, y: 195, size: 150, heading: 90 * _deg, shape: 'polygon', corners: getRightAngleCorners(.5) },
            { x: 350, y: 200, size: 50, shape: 'square' },
            { x: 180, y: 30, size: 25, shape: 'circle' },
            { x: 280, y: 70, size: 25, shape: 'circle' },
        ]
    }),

    new MiniGolfLevel({
        name: "Trick Shot",
        par: 2,
        width: 500,
        height: 300,
        goal: { x: 263, y: 169 },
        ball: { x: 50, y: 120 },
        obstacles: [
            {
                x: 150, y: 100, shape: 'polygon', size: 100, heading: 0, corners: getRectangleCorners(.2)
            },
            {
                x: 60, y: 300 - 40, shape: 'polygon', size: 40, heading: 180 * _deg, corners: getRightAngleCorners(1.5)
            },
            {
                x: 290, y: 60, shape: 'polygon', size: 120, heading: 90 * _deg, corners: getRectangleCorners(.5)
            },
            {
                x: 220, y: 195, shape: 'polygon', size: 50, heading: 90 * _deg, corners: getRectangleCorners(.1)
            },
            {
                x: 360, y: 300, shape: 'polygon', size: 30, heading: 45 * _deg, corners: getRightAngleCorners(1)
            },
        ],
    }),

    new MiniGolfLevel({
        name: "The Cage",
        par: 3,
        width: 400,
        height: 300,
        goal: { x: 250, y: 150 },
        ball: { x: 40, y: 150 },
        obstacles: [
            {
                x: 250, y: 150, shape: 'polygon', size: 30, rotate: .02, corners: squareCage
            },
            {
                x: 250, y: 150, shape: 'polygon', size: 80, rotate: -.03, corners: squareCage
            },
        ]
    }),

    new MiniGolfLevel({
        name: 'Garden Path',
        par: 4, width: 500, height: 375,
        ball: { x: 25, y: 350 },
        goal: { x: 475, y: 350 },
        obstacles: [
            {
                x: 125, y: 125, size: 125, heading: 90 * _deg, shape: 'polygon', corners: getRightAngleCorners(1)
            },
            {
                x: 375, y: 125, size: 125, heading: 0 * _deg, shape: 'polygon', corners: getRightAngleCorners(1)
            },
        ],
        bunkers: [
            { x: 240, y: 350, size: 200, heading: 0, shape: 'circle' },

        ]
    }),

]

export { harderLevels }