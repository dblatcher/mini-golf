import * as Engine from '../../worlds/src/index'
import { levels } from './levels';

import {MiniGolfGame} from './MiniGolfGame'



function init() {

    (window as any).game = new MiniGolfGame({
        mainCanvas: document.querySelector('#mainCanvas'),
        levels,
    })

}

window.onload = init;