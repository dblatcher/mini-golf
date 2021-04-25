import { MiniGolfLevel } from "./MiniGolfLevel"

const levels: MiniGolfLevel[] = [

    new MiniGolfLevel({
        width: 500, height: 300,
        ball: { x: 50, y: 50 },
        goal: { x: 400, y: 150 },
        obstacles: [
            { x: 200, y: 150, size:40, shape:'polygon', corners:[
                {x:-1, y:-1},
                {x:1, y:-1},
                {x:1, y:0},
                {x:.5, y:0},
                {x:.5, y:1},
            ] }
        ]
    }),


    new MiniGolfLevel({ width: 300, height: 500, ball: { x: 70, y: 50 }, goal: { x: 200, y: 440 } })

]

export { levels }