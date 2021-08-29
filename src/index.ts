import {MiniGolfGame} from './MiniGolfGame'
import { levels } from './levels';
import { SoundPlayer } from '../../worlds/src';

const soundPlayer = new SoundPlayer({
    "click": require('../audio/click.mp3'),
    "tap": require('../audio/tap.mp3')
})

function init() {

    (window as any).game = new MiniGolfGame({
        mainCanvas: document.querySelector('#mainCanvas'),
        captionElement: document.querySelector('#caption'),
        messageElement: document.querySelector('#message'),
        resetButton: document.querySelector('#resetButton'),
        controlModeInputs: {
            swipeButton:document.querySelector('input#swipe'),
            clickButton:document.querySelector('input#click'),
        },
        levels,
        soundPlayer
    })

}

window.onload = init;