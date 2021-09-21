import {MiniGolfGame} from './MiniGolfGame'
import { normalLevels } from './normalLevels';
import { SoundPlayer } from '../../worlds/src';
import { MiniGolfLevel } from './MiniGolfLevel';
import { harderLevels } from './harderLevels';

const soundPlayer = new SoundPlayer({
    "click": require('../audio/click.mp3'),
    "tap": require('../audio/tap.mp3')
})

const courseMap = new Map<string, MiniGolfLevel[]>()
    .set("Normal Course", normalLevels)
    .set("Harder Course", harderLevels)

function init() {

    (window as any).game = new MiniGolfGame({
        mainCanvas: document.querySelector('#mainCanvas'),
        captionElement: document.querySelector('#caption'),
        messageElement: document.querySelector('#message'),
        resetButton: document.querySelector('#resetButton'),
        courseSelectElement: document.querySelector('#courseSelect'),
        controlModeInputs: {
            swipeButton:document.querySelector('input#swipe'),
            clickButton:document.querySelector('input#click'),
        },
        soundPlayer,
        courseMap,
    })

}

window.onload = init;