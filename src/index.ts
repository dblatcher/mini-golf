import {MiniGolfGame} from './MiniGolfGame'
import { levels } from './levels';


function init() {

    (window as any).game = new MiniGolfGame({
        mainCanvas: document.querySelector('#mainCanvas'),
        captionElement: document.querySelector('#caption'),
        messageElement: document.querySelector('#message'),
        resetButton: document.querySelector('#resetButton'),
        levels,
    })

}

window.onload = init;