"use strict"

export let context = null
export let canvas = null
export let halfCanvasHeight = null
export let halfCanvasWidth = null
export let assets = []
export let scale = 1

const assetsRoot = '/static/assets';
const assetsPath = [
    `${assetsRoot}/Bar.png`,
    `${assetsRoot}/Bloc.png`,
    `${assetsRoot}/Circle.png`
]

const cacheImage = []

const BLOCK_RADIUS = 20

export class Core {

    constructor(canvasElm) {
        scale = window.devicePixelRatio;
        canvas = canvasElm;
        context = canvas.getContext('2d');
        context.scale(scale,scale)

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        halfCanvasHeight = (window.innerHeight * scale) / 2;
        halfCanvasWidth = (window.innerWidth * scale) / 2;
    }

    /**
     * Preload assets
     */
    static async preload() {

        let loadingAssets = assetsPath.map((path) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.src = path;
                assets.push(img);
            }) 
        })

        return Promise.all(loadingAssets)
    }

    /**
     * 
     * @param {number} leftX 
     * @param {number} topY 
     * @param {number} w 
     * @param {number} h 
     * @param {string} color 
     */
    static drawRect(leftX, topY, w, h, color) {
        context.fillStyle = color
        context.fillRect(leftX, topY, w, h)
    }
    
    /**
     * 
     * @param {number} centerX 
     * @param {number} centerY 
     * @param {number} radius 
     * @param {string} color 
     */
    static drawCircle(centerX, centerY, radius, color) {
        context.fillStyle = color
        context.beginPath()
        context.arc(centerX, centerY, radius, 0, Math.PI * 2, true)
        context.fill()
    }
    
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} textSize 
     * @param {string} color 
     * @param {string} font 
     * @param {string} text 
     */
    static drawText(x, y, textSize, color, font, text) {
        context.font = `normal ${textSize}px ${font}`;
        context.fillStyle = color
        context.fillText(text, x, y);
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {string} path 
     * @param {number} w 
     * @param {number} h
     */
    static drawImage(x, y, path, w, h) {

        const isCached = cacheImage.find(img => img.path === path)

        if(isCached) {
            return context.drawImage(isCached.img, x, y, w, h)
        }

        let img = new Image();
        img.src = path;
        img.onload = function() {
            cacheImage.push({
                path,
                img
            })
            context.drawImage(img, x, y, w, h);
        };
    }

    /**
     * Draw block
     * @param {number} x 
     * @param {number} y 
     * @param {number} size 
     * @param {string} color 
     */
    static drawBlock(x,y, size, color) {

        const blockRadius = BLOCK_RADIUS * scale

        context.strokeStyle = color;
        context.lineJoin = "round";
        context.lineWidth = blockRadius;

        context.strokeRect(
            x + (blockRadius/2), 
            y + (blockRadius/2), 
            size - blockRadius, 
            size - blockRadius
        );
        context.fillStyle = color;
        context.fillRect(
            x + (blockRadius/2), 
            y + (blockRadius/2), 
            size - blockRadius, 
            size - blockRadius
        );
    }

    /**
     * @param  {number} xStart
     * @param  {number} yStart
     * @param  {number} xEnd
     * @param  {number} yEnd
     * @param  {number} lineWidth
     * @param  {string} color
     */
    static drawLine(xStart, yStart, xEnd, yEnd, lineWidth, color) {
        context.beginPath();
        context.moveTo(xStart,yStart);
        context.lineTo(xEnd, yEnd);
        context.lineWidth = lineWidth;
        context.strokeStyle = color;
        context.lineCap="round"
        context.stroke();
    }

    /**
     * Using this method to debug and check the center of the canvas
     */
    static drawNet() {
        for(var i = 0; i < canvas.height; i += 40) {
            context.fillStyle = 'white'
            context.fillRect(canvas.width/2 - 1, i, 2, 20)
        }
    }

    /**
     * Suspends the execution until the time-out interval elapses
     * @param {integer} ms Milliseconds to sleep
     */
    static async sleep(ms) {
        return new Promise(async (resolve) => {
            await setTimeout(resolve, ms);
        })
    }
}
