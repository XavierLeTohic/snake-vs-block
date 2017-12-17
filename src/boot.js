"use strict"

import { canvas, Core, halfCanvasHeight, halfCanvasWidth, scale } from './core'
const { drawRect, drawImage, drawText, drawCircle } = Core;

/**
 * Credits page class
 */
export default class Boot {

    VISIBILITY_DURATION = 1500
    HIDE_ANIMATION_DURATION = 1000

    VOODOO_LOGO_HEIGHT = 85
    VOODOO_LOGO_WIDTH = 300
    BENTO_LOGO_HEIGHT = 85
    BENTO_LOGO_WIDTH = 150

    LIGHT_FONT_SIZE = 33
    BOLD_FONT_SIZE = 48
    CIRCLE_RADIUS = 10

    framesPerSecond = 60

    blackBlock = {
        x: 0,
        y: 0
    }

    whiteBlock = {
        x: 0,
        y: (canvas.height/2)
    }

    constructor() {

        this.voodooLogo = {
            x: halfCanvasWidth - ((this.VOODOO_LOGO_WIDTH * scale) / 2),
            y: (halfCanvasHeight / 2) - ((this.VOODOO_LOGO_HEIGHT * scale) / 2)
        }

        this.bentoLogo = {
            x: halfCanvasWidth - ((this.BENTO_LOGO_WIDTH * scale) / 2),
            y: ((halfCanvasHeight / 2) * 3) - ((this.BENTO_LOGO_HEIGHT * scale) / 2)
        }

    }

    /**
     * Display the boot state the first time
     */
    display() {

        // Preload fonts because preload seems not working on chrome :'(
        drawText(0, -200, 1, 'black', 'Montserrat-Thin', 'a')
        drawText(0, -200, 1, 'black', 'Montserrat-Regular', 'a')

        this.draw()
        return Promise.resolve()
    }

    /**
     * Hide the boot state with animation
     */
    hide() {

        this.animation = setInterval(() => {
            
            if(this.blackBlock.x >= -(canvas.width) && this.whiteBlock.x <= canvas.width) {
                this.blackBlock.x -= 25
                this.voodooLogo.x -= 25

                this.whiteBlock.x += 25
                this.bentoLogo.x += 25
                this.draw()
            } else {
                clearInterval(this.animation)
            }

        }, 1000 / this.framesPerSecond)
    }

    draw() {

        // Background
        drawRect(0, 0, canvas.width, canvas.height, 'black')

        // Black and white block
        drawRect(this.blackBlock.x, this.blackBlock.y, canvas.width, canvas.height / 2, '#212121')
        drawRect(this.whiteBlock.x, this.whiteBlock.y, canvas.width, canvas.height / 2, 'white')

        // Voodoo and Bento logo
        drawImage(this.voodooLogo.x, this.voodooLogo.y, "static/voodoo.png", this.VOODOO_LOGO_WIDTH*scale, this.VOODOO_LOGO_HEIGHT*scale)
        drawImage(this.bentoLogo.x, this.bentoLogo.y, "static/bento.png", this.BENTO_LOGO_WIDTH*scale, this.BENTO_LOGO_HEIGHT*scale)

        // During the hide animation we display a preview of the start screen.
        // When the white and black block are enough away from the center we can
        // write the text without blink effect.
        if(this.blackBlock.x < -(canvas.width/2) - (canvas.width/4)) {
            this.drawStartScreen()
        }
    }

    drawStartScreen() {
        
        drawText(
            halfCanvasWidth - (50*scale), 
            halfCanvasHeight - (55*scale) - (canvas.height/4), 
            this.LIGHT_FONT_SIZE * scale, 
            'white', 
            'Montserrat-Thin', 
            'Snake'
        )
        drawText(halfCanvasWidth - (35*scale), 
            halfCanvasHeight - (canvas.height/4), 
            this.BOLD_FONT_SIZE * scale, 
            'white', 
            'Montserrat-Regular', 
            'VS'
        )
        drawText(halfCanvasWidth - (45*scale), 
            halfCanvasHeight + (45 * scale) - (canvas.height/4), 
            this.LIGHT_FONT_SIZE * scale, 
            'white', 
            'Montserrat-Thin', 
            'Block'
        )

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
}