"use strict"

import { canvas, Core, halfCanvasHeight, halfCanvasWidth, scale } from './core'
const { drawRect, drawImage, drawText, drawCircle, drawNet, sleep, drawBlock } = Core;

/**
 * Credits page class
 */
export default class Play {

    CIRCLE_RADIUS = 10;
    CIRCLE_DIAMETER = this.CIRCLE_RADIUS * 2
    framesPerSecond = 60;
    lastCoordinateX = 0;
    
    end = false
    circles = []
    cols = []
    points = []
    blocks = []

    availableCircle = {
        x: 0,
        y: 0,
        value: 4
    }

    draw() {

        drawRect(0, 0, canvas.width, canvas.height, 'black')

        //drawBlock(10, 0, 500, 'red')

        for(var i = 0; i < this.points.length; i++) {
            drawCircle(
                this.points[i].x, 
                this.points[i].y,
                this.CIRCLE_RADIUS * scale, 
                `rgb(255, 204, 0)`
            );
            drawText(
                this.points[i].x - 8, 
                this.points[i].y - 30,
                 14 * scale, 
                 'white', 
                 'Montserrat-Regular', 
                 this.points[i].value)
        }

        drawText(
            this.availableCircle.x, 
            this.availableCircle.y,
             14 * scale, 
             'white', 
             'Montserrat-Regular', 
             this.availableCircle.value)


        for(var i = 0; i < this.circles.length; i++) {
            drawCircle(
                this.circles[i].x, 
                this.circles[i].y,
                this.CIRCLE_RADIUS * scale, 
                `rgb(255, 204, 0)`
            );
        }
    }

    addPoints() {

        const numberOfPoints = Math.floor(Math.random() * 4) + 1

        for(var i = 0; i < numberOfPoints; i++) {
            this.points.push({
                x: this.cols[i],
                y: - 40,
                value:  Math.floor(Math.random() * 5) + 1
            })
        }
    }

    updatePoints() {

        this.points = this.points.reduce((previous, point) => {

            // Check if the points y position are upper than canvas height
            if(point.y < (halfCanvasHeight * 2)) {

                // Collision
                if(point.y > (this.availableCircle.y - 10) && point.y < this.availableCircle.y + 40
                    && point.x > (this.availableCircle.x - 10) && point.x < this.availableCircle.x + 40
                ) {
            
                    if(this.circles.length < 10) {
                        this.circles.push({
                            x: this.circles[this.circles.length - 1].x,
                            y: this.circles[this.circles.length - 1].y + 40
                        })
                    }
    
                    this.availableCircle.value += point.value;
    
                    return previous
                } else {
                    return previous.concat([{
                        x: point.x,
                        y: point.y + 10,
                        value: point.value
                    }])
                }
            }
            return previous
        }, [])
    }

    /**
     * Called after the start animation
     */
    startGame() {

        const oneColWith = halfCanvasWidth / 2;

        this.cols = [
            oneColWith / 2,
            halfCanvasWidth,
            halfCanvasWidth + oneColWith,
            canvas.width - 50
        ];

        canvas.addEventListener("touchmove", this.handleTouch, false);

        this._play_animation = setInterval(() => {
            this.updatePoints()
            this.draw()
        }, 1000 / this.framesPerSecond)

        setTimeout(() => {
            this.addPoints()
            setInterval(() => {
                this.addPoints()
            }, 1500)
        }, 1000)

    }

    /**
     * When user swipe on the screen during the game
     */
    handleTouch = async ({ changedTouches }) => {
        const touch = changedTouches[0];

        // First touch
        if(this.lastCoordinateX === 0) {
            this.lastCoordinateX = touch.pageX
            return false
        }

        // Check the distance
        const distance = Math.abs(this.lastCoordinateX - touch.pageX)

        // Swipe left
        if(this.lastCoordinateX > touch.pageX) {

            if(this.circles[0].x - distance < this.CIRCLE_RADIUS) {
                return false
            }

            this.availableCircle.x -= distance
            this.circles[0].x -= distance

            this.circles.map((circle, key) => {
                if(key !== 0) {
                    setTimeout(() => {
                        circle.x -= distance
                    }, 40 * (key/1.5));
                }
            })
        } else {
            // Swipe right

            if(this.circles[0].x + distance > ((window.innerWidth * scale) - this.CIRCLE_RADIUS)) {
                return false
            }

            this.availableCircle.x += distance
            this.circles[0].x += distance

            this.circles.map((circle, key) => {
                if(key !== 0) {

                    setTimeout(() => {
                        circle.x += distance
                    }, 40 * (key/1.5));
                }
            })
        }

        this.lastCoordinateX = touch.pageX
    }


    /**
     * When the game was started
     */
    async startAnimation() {
        return new Promise((resolve, reject) => {

            const startYPosition = halfCanvasHeight + (canvas.height / 6);

            this._start_animation = setInterval(() => {

                if(this.circles[0].y > (startYPosition - (50*scale))) {

                    this.availableCircle.y -= (6*scale)

                    this.circles.map((circle, key) => {
                        circle.y -= (5*scale) - ((2*scale) * key)
                    })

                    this.draw()
                } else {
                    clearInterval(this._start_animation);
                    resolve();
                }
            }, 1000 / this.framesPerSecond)
        })
    }

    /**
     * Run the game
     */
    async run() {

        this.availableCircle.x = halfCanvasWidth - (3*scale);
        this.availableCircle.y = (halfCanvasHeight + (canvas.height / 6)) - 20;

        const defaultX = halfCanvasWidth;
        const defaultY = halfCanvasHeight + (canvas.height / 6);

        for(let i = 0; i < this.availableCircle.value; i++) {
            this.circles.push({ x: defaultX, y: defaultY })
        }

        this.draw()

        await this.startAnimation()
        this.startGame()
    }
}