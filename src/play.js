"use strict"
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
    startAnimationEnded = false;
    lastAddedTime = 0;
    lastBlockCollisionTime = 0;
    restartLabelTime = 0;
    restart = false;

    listenersApplied = false;
    lastCoordinateX = 0;
    distanceToX = 0;
    swipeDirection = '';

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
                    'black',
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
                    halfCanvasWidth - (halfCanvasWidth / 4),
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

    getBlockColor(blockValue) {

        const currentPoints = this.availableCircle.value;

        if(blockValue === 1) {
            return '#69F0AE'
        } else if(blockValue <= 4) {
            return '#00E676'
        } else if(blockValue <= 8) {
            return '#00C853'
        } else if (blockValue <= 12) {
            return '#FFD54F'
        } else if(blockValue <= 16) {
            return '#FFCA28'
        } else if(blockValue <= 20) {
            return '#FF8F00'
        } else if(blockValue >= 21) {
            return '#D84315'
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

            const value = Math.floor(Math.random() * (this.availableCircle.value * 2)) + 1

            this.blocks.push({
                x: x,
                y: -(blockSize * 3),
                size: blockSize - (margin * 2),
                value: value,
                color: this.getBlockColor(value)
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

    async updateCircles() {

        // Value was not set yet
        if(this.lastCoordinateX === 0 || this.circles.length === 0) {
            return false;
        }

        // Update the first circle x position and current score value
        if(this.lastCoordinateX >= this.CIRCLE_RADIUS && this.lastCoordinateX <= canvas.width - this.CIRCLE_RADIUS) {
            this.circles[0].x = this.lastCoordinateX
            this.availableCircle.x = this.lastCoordinateX - 10
        }

        for(var i = 1; i < this.circles.length; i++) {
            const circle = this.circles[i],
                prev = this.circles[i - 1],
                distance = Math.sqrt((circle.x - prev.x) * (circle.x - prev.x)),
                speed = Math.abs(circle.x - prev.x) / (3 * scale);
                circle.y = prev.y + (this.CIRCLE_DIAMETER * scale);
            
            if(distance < speed) {
                circle.x = prev.x;
            }
            else if(circle.x > prev.x && (circle.x - speed) >= 0) {
                circle.x -= speed;
            }
            else if(circle.x < prev.x && (circle.x - speed) <= canvas.width) {
                circle.x += speed;
            }     
        }
    }

    /**
     * Called every 500ms when player was colliding with a block
     */
    handleBlockCollision() {
        if (this.hitBlock !== null && this.hitBlock.value > 0 && this.availableCircle.value > 0) {
            this.hitBlock.value -= 1
            this.hitBlock.color = this.getBlockColor(this.hitBlock.value)
            this.availableCircle.value -= 1

            if(this.availableCircle.value === 0 && !this.end) {
                this.end = true
                window.cancelAnimationFrame(this.play_animation)
                canvas.removeEventListener("touchmove", this.onTouch);
                canvas.addEventListener("touchstart", this.onTouch);

                if(this.bestScore === 0 || this.score > this.bestScore) {
                    this.newBestScore = true
                    this.bestScore = this.score
                    localStorage.setItem('bestScore', this.score)
                }

                window.requestAnimationFrame(this.restartLabelAnimation)
            }

            this.circles.pop()
  
        }
    }

    /**
     * Add points on hidden the top of the canvas
     */
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

    /**
     * Update points y position and remove points with 
     * y position upper than canvas height
     */
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
                        const lastCircle = this.circles[this.circles.length - 1];

                        this.circles.push({
                            x: lastCircle.x,
                            y: lastCircle.y + (20 * scale) 
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

    /**
     * When user leave the tab pause the game
     */
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
    onTouch = async ({ changedTouches }) => {
        const touch = changedTouches[0];

        // Called when the game was ended and touch the screen
        if(this.end) {
            // Remove all listeners and interval before showing the start screen
            this.restart = true
            canvas.removeEventListener("touchstart", this.onTouch)
            document.removeEventListener("visibilitychange", this.onTabFocusOff)
            return this.showStartScreen(this.run.bind(this))
        }

        // First touch
        if (this.lastCoordinateX === 0) {
            this.lastCoordinateX = touch.pageX
            return false
        }

        this.distanceToX = Math.abs(this.lastCoordinateX - touch.pageX) * scale
        this.swipeDirection = (this.lastCoordinateX > touch.pageX ? 'left' : 'right');
        this.lastCoordinateX = touch.pageX
    }

    applyListeners() {
        this.listenersApplied = true;
        canvas.addEventListener("touchmove", this.onTouch, false);
        document.addEventListener("visibilitychange", this.onTabFocusOff);
    }

    restartLabelAnimation = (timestamp) => {

        if(!this.end || this.restart) {
            return false
        }

        if(!this.restartLabelTime || this.restartLabelTime - this.restartLabelTime <= 100) {
            this.restartLabelTime = timestamp;

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

            this.draw()
            window.requestAnimationFrame(this.restartLabelAnimation)
        }
    }

    /**
     * Animation of circles before be able to play
     */
    beforePlayAnimation = () => {

        const startYPosition = halfCanvasHeight + (canvas.height / 6);

        if (this.circles[0].y > (startYPosition - (50 * scale))) {

            this.availableCircle.y -= (6 * scale)
            this.circles.map((circle, key) => {
                circle.y -= (5 * scale) - ((2 * scale) * key)
            })

            this.draw()

            window.requestAnimationFrame(this.beforePlayAnimation)
        } else {
            this.startAnimationEnded = true
            this.applyListeners()
            window.cancelAnimationFrame(this.before_play_animation)
        }
    }

    /**
     * Animation during the game session
     * @param {number} timestamp 
     */
    playAnimation = (timestamp) => {

        if(this.startAnimationEnded === false) {
            return window.requestAnimationFrame(this.playAnimation)
        }

        if (!this.end && !this.pause) {

            if(!this.lastAddedTime && ! this.lastBlockCollisionTime) {
                this.lastAddedTime = this.lastBlockCollisionTime =  timestamp
                this.addPoints();
                this.addBlocks();
            } else {

                if(timestamp - this.lastAddedTime >= 1500) {
                    // Each 1,5s add points and blocks
                    this.addPoints();
                    this.addBlocks();
                    this.lastAddedTime = timestamp;
    
                } else if(timestamp - this.lastBlockCollisionTime >= 100) {
                    // Each 100ms handle block collision
                    if(this.blocked) {
                       this.handleBlockCollision() 
                    }
                    this.lastBlockCollisionTime = timestamp
                }
            }

            this.updateCircles()
            this.updateBlocks()
            this.updatePoints()
            this.draw()

            window.requestAnimationFrame(this.playAnimation)
        } else {
            this.draw()
        }
    }


    /**
     * Run the game
     */
    async run(showStartScreen) {

        this.showStartScreen = showStartScreen

        // Reset values
        this.startAnimationEnded = false
        this.listenersApplied = false
        this.lastAddedTime = 0
        this.lastBlockCollisionTime = 0
        this.restartLabelTime = 0
        this.restart = false;
        this.availableCircle.x = halfCanvasWidth - (3 * scale)
        this.availableCircle.y = (halfCanvasHeight + (canvas.height / 6)) - 20
        this.availableCircle.value = 4
        this.restartOpacity = 0
        this.reverseOpacity = false
        this.blocks = []
        this.points = []
        this.circles = []
        this.cols = []
        this.pause = false
        this.blocked = false
        this.hitBlock = null
        this.end = false
        this.lastCoordinateX = 0

        const defaultX = halfCanvasWidth
        const defaultY = halfCanvasHeight + (canvas.height / 6)

        for (let i = 0; i < this.availableCircle.value; i++) {
            this.circles.push({ x: defaultX, y: defaultY })
        }

        if(localStorage.key('bestScore') !== null) {
            this.bestScore = parseInt(localStorage.getItem('bestScore'));
        } else {
            this.bestScore = 0;
        }

        // Initialization of columns for points position
        const oneColWith = halfCanvasWidth / 2;
        for(let i = 1; i <= 5; i++) {
            this.cols.push(oneColWith * i)
        }

        // Draw the circle of the start screen
        this.draw()

        this.before_play_animation = window.requestAnimationFrame(this.beforePlayAnimation)
        this.play_animation = window.requestAnimationFrame(this.playAnimation)
    }
}