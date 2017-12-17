"use strict"

import { canvas, Core, halfCanvasHeight, halfCanvasWidth, scale } from './core'
const { drawRect, drawImage, drawText, drawCircle } = Core;

/**
 * Credits page class
 */
export default class Start {

    framesPerSecond = 60;
    startInstructionOpacity = 0;
    reverseOpacity = false;
    useTouch = false;
    bestScore = 0;

    LIGHT_FONT_SIZE = 33
    BOLD_FONT_SIZE = 48
    CIRCLE_RADIUS = 10

    draw() {

        // Background
        drawRect(0, 0, canvas.width, canvas.height, 'black')

        drawText(
            halfCanvasWidth - (50*scale), 
            halfCanvasHeight - (55*scale) - (canvas.height/4), 
            this.LIGHT_FONT_SIZE * scale, 
            'white', 
            'Montserrat-Thin', 
            'Snake'
        )
        drawText(
            halfCanvasWidth - (35*scale), 
            halfCanvasHeight - (canvas.height/4), 
            this.BOLD_FONT_SIZE * scale, 
            'white', 
            'Montserrat-Regular', 
            'VS'
        )
        drawText(
            halfCanvasWidth - (45*scale), 
            halfCanvasHeight + (45 * scale) - (canvas.height/4), 
            this.LIGHT_FONT_SIZE * scale, 
            'white', 
            'Montserrat-Thin', 
            'Block'
        )

        if(this.bestScore > 0) {
            drawText(
                halfCanvasWidth - (40 * scale), 
                halfCanvasHeight - (halfCanvasHeight / 7), 
                16 * scale, 
                'white', 
                'Montserrat-Thin', 
                'Best score :'
            )

            drawText(
                halfCanvasWidth - ((this.bestScore > 9 ? 15 : 10) * scale), 
                halfCanvasHeight, 
                this.LIGHT_FONT_SIZE * scale, 
                'white', 
                'Montserrat-Regular', 
                this.bestScore
            )
        }

        // Start instruction text
        drawText(
            halfCanvasWidth - (55 * scale), 
            halfCanvasHeight + (canvas.height/3), 
            22 * scale, 
            `rgba(255, 255, 255, ${this.startInstructionOpacity.toFixed(2)})`, 
            'Montserrat-Thin', 
            'Tap to play'
        );

        drawText(
            halfCanvasWidth - (4*scale), 
            (halfCanvasHeight + canvas.height/6) - (20*scale),
             14 * scale, 
             'white', 
             'Montserrat-Regular', 
             '4')

        drawCircle(
            halfCanvasWidth, 
            halfCanvasHeight + canvas.height/6, 
            this.CIRCLE_RADIUS * scale, 
            `rgb(255, 204, 0)`
        );

    }

    /**
     * Show the start state
     */
    show(runGame) {

        this.runGame = runGame

        canvas.addEventListener("touchstart", this.onTouch)
        canvas.addEventListener("mousedown", this.onTouch)

        if(localStorage.key('bestScore') !== null) {
            this.bestScore = localStorage.getItem('bestScore')
        }

        // Start instruction text blinking
        this.instructionAnimation = setInterval(() => {
            
            const opacity = parseFloat(this.startInstructionOpacity.toFixed(2));

            if(opacity <= 1 && !this.reverseOpacity) {
                this.startInstructionOpacity += 0.04
                if(opacity === 1) {
                    this.reverseOpacity = !this.reverseOpacity
                }
            } else if(opacity >= 0 && this.reverseOpacity) {
                this.startInstructionOpacity -= 0.04
                if(opacity === 0) {
                    this.reverseOpacity = !this.reverseOpacity
                }
            }

            this.draw()
        }, 20)

        this.draw()
    }

    onTouch = (evt) => {
        evt.preventDefault();

        if(evt.type === 'touchstart') {
            this.useTouch = true
        }

        if (evt.type === "touchend" || evt.type === "mousedown" && this.useTouch === true) {
            return false;
        }

        clearInterval(this.instructionAnimation);
        canvas.removeEventListener("touchstart", this.onTouch)
        canvas.removeEventListener("mousedown", this.onTouch)

        this.runGame(this.show.bind(this))
      }
}