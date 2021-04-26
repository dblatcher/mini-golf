import { MiniGolfLevel } from "./MiniGolfLevel"

const levels: MiniGolfLevel[] = [

    new MiniGolfLevel({ par:2, width: 300, height: 500, ball: { x: 70, y: 50 }, goal: { x: 200, y: 440 } }),

    new MiniGolfLevel({
        par:4, width: 500, height: 300,
        ball: { x: 50, y: 50 },
        goal: { x: 400, y: 150 },
        obstacles: [
            { x: 230, y: 120, size:60, heading:.1, shape:'polygon', corners:[
                {x:-1, y:-1},
                {x:1, y:-1},
                {x:1, y:0},
                {x:.5, y:0},
                {x:.5, y:1},
            ] },
            { x: 430, y: 220, size:30, heading:.2, shape:'square'},
        ]
    }),


    

]

export { levels }