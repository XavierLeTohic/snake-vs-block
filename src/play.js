"use strict"
import randomColor from 'randomcolor'
import { canvas, Core, halfCanvasHeight, halfCanvasWidth, scale } from './core'
const { drawRect, drawImage, drawText, drawCircle, drawNet, sleep, drawBlock } = Core;

/**
 * Credits page class
 */
export default class Play {

    CIRCLE_RADIUS = 10;
    CIRCLE_DIAMETER = this.CIRCLE_RADIUS * 2
    BLOCK_MARGIN = 1

    framesPerSecond = 60;
    lastCoordinateX = 0;

    score = 0
    end = false
    pause = false
    newBestScore = false
    bestScore = 0
    blocked = false
    circles = []
    cols = []
    points = []
    blocks = []
    hitBlock = null
    restartOpacity = 0
    reverseOpacity = false

    availableCircle = {
        x: 0,
        y: 0,
        value: 4
    }

    draw() {

        drawRect(0, 0, canvas.width, canvas.height, 'black')

        for (const block of this.blocks) {

            if(block.value > 0) {
                drawBlock(block.x, block.y, block.size, block.color)

                drawText(
                    block.x + (block.size / 2) - (this.value > 9 ? (10 * scale) : (6 * scale)),
                    block.y + (block.size / 2) + (7 * scale),
                    22 * scale,
                    'white',
                    'Montserrat-Regular',
                    block.value
                )
            }
        }

        // Falling points
        for (const point of this.points) {

            drawCircle(
                point.x,
                point.y,
                this.CIRCLE_RADIUS * scale,
                `rgb(255, 204, 0)`
            )

            drawText(
                point.x - (4 * scale),
                point.y - (20 * scale),
                14 * scale,
                'white',
                'Montserrat-Regular',
                point.value
            )
        }

        if (this.end === true) {

            // Game score white block
            drawBlock(
                halfCanvasWidth / 2,
                halfCanvasHeight / 4,
                halfCanvasWidth,
                'white'
            )

            // Score
            drawText(
                halfCanvasWidth - (this.score > 9 ? (25 * scale) : (15 * scale)),
                halfCanvasHeight / 2,
                45 * scale,
                'black',
                'Montserrat-Regular',
                this.score
            )

            if(this.newBestScore) {
                // New best score label
                drawText(
                    halfCanvasWidth - (halfCanvasWidth / 3),
                    (halfCanvasHeight / 2) + (halfCanvasHeight / 8),
                    14 * scale,
                    'black',
                    'Montserrat-Thin',
                    `New best score !`
                )
            } else {
                // New best score label
                drawText(
                    halfCanvasWidth - (halfCanvasWidth / 6),
                    (halfCanvasHeight / 2) + (halfCanvasHeight / 8),
                    14 * scale,
                    'black',
                    'Montserrat-Thin',
                    `Best score :`
                )

                // Best score value
                drawText(
                    halfCanvasWidth - (this.bestScore > 9 ? (10 * scale) : (5 * scale)),
                    (halfCanvasHeight / 2) + (halfCanvasHeight / 4.5),
                    22 * scale,
                    'black',
                    'Montserrat-Regular',
                    this.bestScore
                )
            }

            // Continue label
            drawText(
                halfCanvasWidth - (75 * scale), 
                halfCanvasHeight + (canvas.height/3), 
                22 * scale, 
                `rgba(255, 255, 255, ${this.restartOpacity.toFixed(2)})`, 
                'Montserrat-Thin', 
                'Tap to continue'
            );


        } else {

            // Current player available points
            drawText(
                this.availableCircle.x,
                this.availableCircle.y,
                14 * scale,
                'white',
                'Montserrat-Regular',
                this.availableCircle.value
            )

            // Current player available points line
            for (const circle of this.circles) {
                drawCircle(
                    circle.x,
                    circle.y,
                    this.CIRCLE_RADIUS * scale,
                    `rgb(255, 204, 0)`
                )
            }
        }
    }

    addBlocks() {

        if (this.blocked || this.end || this.pause) {
            return false
        }

        const margin = (this.BLOCK_MARGIN * scale)
        const blockSize = (canvas.width / 5)

        for (let i = 0; i < 5; i++) {

            let x;

            if (i === 0) {
                x = margin
            } else {
                x = margin + (blockSize * i)
            }

            this.blocks.push({
                x: x,
                y: -(blockSize * 3),
                size: blockSize - (margin * 2),
                value: Math.floor(Math.random() * (this.availableCircle.value * 2)) + 1,
                color: randomColor()
            })
        }

    }

    updateBlocks() {

        if(this.end || this.pause) {
            return false
        }

        // First check for collision
        for (const block of this.blocks) {

            const blockBottomPosition = block.y + block.size
            const blockMargin = this.BLOCK_MARGIN * scale
            const playerX = this.circles[0].x;
            const playerY = this.circles[0].y;

            if (blockBottomPosition >= (playerY - (this.CIRCLE_DIAMETER + 1))
                && blockBottomPosition <= (playerY + this.CIRCLE_DIAMETER)
            ) {
                // Collision X
                if (playerX >= (block.x - blockMargin)
                    && playerX <= ((block.x - blockMargin) + (block.size + blockMargin))
                ) {

                    if (block.value > 0) {
                        this.blocked = true
                        this.hitBlock = block
                    } else {
                        this.blocked = false
                        this.hitBlock = null
                    }

                }
            }
        }

        // Update blocks position and handle blocks to remove
        if (!this.blocked) {

            this.blocks = this.blocks.reduce((previous, block, key) => {

                // Remove the block from the array when outside of canvas
                if (block.y > canvas.height) {
                    return previous;
                }

                // Remove the block from the array if value is 0
                if (block.value === 0) {
                    return previous
                }

                let { y, ...props } = block

                return previous.concat([{
                    y: y += (6.5 * scale),
                    ...props
                }])

            }, []);
        }
    }

    // Called every 500ms when player was colliding with a block
    handleBlockCollision() {
        if (this.hitBlock !== null && this.hitBlock.value > 0 && this.availableCircle.value > 0) {
            this.hitBlock.value -= 1
            this.availableCircle.value -= 1

            if(this.availableCircle.value === 0 && !this.end) {
                canvas.removeEventListener("touchmove", this.handleTouch);
                this.end = true

                if(this.score > this.bestScore) {
                    this.newBestScore = true
                    this.bestScore = this.score
                    localStorage.setItem('bestScore', this.score)
                }

                this._restart_animation = setInterval(this.restartAnimation, 20);
                canvas.addEventListener("touchstart", this.handleTouch)
            }

            this.circles.pop()
  
        }
    }

    addPoints() {

        if (this.blocked || this.end || this.pause) {
            return false
        }

        const numberOfPoints = Math.floor(Math.random() * 3) + 1

        for (var i = 0; i < numberOfPoints; i++) {
            this.points.push({
                x: this.cols[i],
                y: -40,
                value: Math.floor(Math.random() * 5) + 1
            })
        }
    }

    updatePoints() {

        if (this.blocked || this.end || this.pause) {
            return false
        }

        this.points = this.points.reduce((previous, point) => {

            // Check if the points y position are upper than canvas height
            if (point.y < (halfCanvasHeight * 2)) {

                // Collision with points
                if (point.y > (this.availableCircle.y - 10) && point.y < this.availableCircle.y + 40
                    && point.x > (this.availableCircle.x - 10) && point.x < this.availableCircle.x + 40
                ) {

                    // Adding points as circles on the screen
                    for (let i = 0; i < point.value; i++) {
                        this.circles.push({
                            x: this.circles[this.circles.length - 1].x,
                            y: this.circles[this.circles.length - 1].y + (20 * scale)
                        })
                    }

                    this.availableCircle.value += point.value;
                    this.score += point.value;

                    return previous
                } else {

                    if (!this.blocked) {

                        let { y, ...props } = point;

                        return previous.concat([{
                            y: y + (6.5 * scale),
                            ...props
                        }])
                    }
                    return previous
                }
            }
            return previous
        }, [])
    }

    onTabFocusOff = () => {
        if(document.visibilityState === 'hidden') {
            this.pause = true;
        } else {
            this.pause = false;
        }
    }

    /**
     * When user swipe on the screen during the game
     */
    handleTouch = async ({ changedTouches }) => {
        const touch = changedTouches[0];

        if(this.end) {

            // Remove all listeners and interval before showing the start screen
            clearInterval(this._restart_animation);
            clearInterval(this._play_animation);
            clearInterval(this._start_animation);
            clearInterval(this._add_elements_animation);
            clearInterval(this._block_collision_animation);
            canvas.removeEventListener("touchstart", this.handleTouch)
            document.removeEventListener("visibilitychange", this.onTabFocusOff)

            return this.showStartScreen(this.run.bind(this))
        }

        // First touch
        if (this.lastCoordinateX === 0) {
            this.lastCoordinateX = touch.pageX
            return false
        }

        // Check the distance
        const distance = Math.abs(this.lastCoordinateX - touch.pageX) * scale

        // Swipe left
        if (this.lastCoordinateX > touch.pageX) {

            if (this.circles[0].x - distance < this.CIRCLE_RADIUS) {
                return false
            }

            this.availableCircle.x -= distance
            this.circles[0].x -= distance

            this.circles.map(async (circle, key) => {
                await sleep(70 * key)
                if (key !== 0) {
                    circle.x -= distance
                }
            })
        } else {
            // Swipe right

            if (this.circles[0].x + distance > ((window.innerWidth * scale) - this.CIRCLE_RADIUS)) {
                return false
            }

            this.availableCircle.x += distance
            this.circles[0].x += distance

            this.circles.map(async (circle, key) => {
                await sleep(70 * key)
                if (key !== 0) {
                    circle.x += distance
                }
            })
        }

        this.lastCoordinateX = touch.pageX
    }

    restartAnimation = () => {
            
        const opacity = parseFloat(this.restartOpacity.toFixed(2));

        if(opacity <= 1 && !this.reverseOpacity) {
            this.restartOpacity += 0.04
            if(opacity === 1) {
                this.reverseOpacity = !this.reverseOpacity
            }
        } else if(opacity >= 0 && this.reverseOpacity) {
            this.restartOpacity -= 0.04
            if(opacity === 0) {
                this.reverseOpacity = !this.reverseOpacity
            }
        }
    }

    /**
     * Deploying first coins animation
     */
    async startAnimation() {
        return new Promise((resolve, reject) => {

            const startYPosition = halfCanvasHeight + (canvas.height / 6);

            this._start_animation = setInterval(() => {

                if (this.circles[0].y > (startYPosition - (50 * scale))) {

                    this.availableCircle.y -= (6 * scale)

                    this.circles.map((circle, key) => {
                        circle.y -= (5 * scale) - ((2 * scale) * key)
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
     * Called after the start animation
     */
    startGame() {

        const oneColWith = halfCanvasWidth / 2;
        
        for(let i = 1; i <= 5; i++) {
            this.cols.push(oneColWith * i)
        }

        canvas.addEventListener("touchmove", this.handleTouch, false);
        document.addEventListener("visibilitychange", this.onTabFocusOff);

        this._play_animation = setInterval(() => {

            if (this.availableCircle.value > 0) {
                this.updateBlocks()
                this.updatePoints()
                this.draw()
            } else {
                this.draw()
            }

        }, 1000 / this.framesPerSecond)

        this.addPoints()

        this._add_elements_animation = setInterval(() => {
            this.addPoints()
            this.addBlocks()
        }, 1500)

        this._block_collision_animation = setInterval(() => {
            if (this.blocked) {
                this.handleBlockCollision()
            }
        }, 100)
    }

    /**
     * Run the game
     */
    async run(showStartScreen) {

        this.showStartScreen = showStartScreen

        // Reset values
        this.availableCircle.x = halfCanvasWidth - (3 * scale);
        this.availableCircle.y = (halfCanvasHeight + (canvas.height / 6)) - 20;
        this.availableCircle.value = 4;
        this.restartOpacity = 0;
        this.reverseOpacity = false;
        this.blocks = [];
        this.points = [];
        this.circles = [];
        this.cols = [];
        this.pause = false;
        this.blocked = false;
        this.hitBlock = null;
        this.end = false;

        const defaultX = halfCanvasWidth;
        const defaultY = halfCanvasHeight + (canvas.height / 6);

        for (let i = 0; i < this.availableCircle.value; i++) {
            this.circles.push({ x: defaultX, y: defaultY })
        }

        if(localStorage.key('bestScore') !== null) {
            this.bestScore = parseInt(localStorage.getItem('bestScore'));
        } else {
            this.bestScore = 0;
        }

        this.draw()
        await this.startAnimation()
        this.startGame()
    }
}