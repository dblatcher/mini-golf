import { MiniGolfLevel } from "./MiniGolfLevel"

const levels: MiniGolfLevel[] = [




    new MiniGolfLevel({
        name:'Sand Trap',
        par: 4, width: 500, height: 500,
        ball: { x: 50, y: 100 },
        goal: { x: 450, y: 50 },
        obstacles: [
            {
                x: 230, y: 160, size: 160, heading: 0, shape: 'polygon', corners: [
                    { x: -.25, y: -1 },
                    { x: .25, y: -1 },
                    { x: .25, y: 1 },
                    { x: -.25, y: 1 },
                ]
            },
            { x: 430, y: 220, size: 30, heading: .2, shape: 'square' },
        ],
        bunkers: [
            { x: 330, y: 340, size: 90, heading: .7, shape: 'circle' },
        ]
    }),

    new MiniGolfLevel({ 
        name:'Whirlyjig',
        par: 2, width: 300, height: 500, ball: { x: 70, y: 50 }, goal: { x: 200, y: 440 },
        obstacles: [
            {
                x: 150, y: 250, size: 100, heading: 0, shape: 'polygon', rotate:.02, corners: [
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


    new MiniGolfLevel({
        name:'Tap round',
        par: 4, width: 500, height: 300,
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
        ]
    }),




]

export { levels }