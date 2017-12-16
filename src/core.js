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
     * @param {number} w 
     * @param {string} color 
     */
    static drawBlock(x,y, w, color) {
       
        context.beginPath();
        context.lineWidth="5";
        context.strokeStyle = color;
        context.moveTo(x + 10, x);
        context.lineTo(w, 10);
        context.quadraticCurveTo(w + 10, 10, w + 10, 20);

        context.lineTo(w + 10, w);
        context.quadraticCurveTo(w + 10, w + 10, w, w + 10);
        
        context.lineTo(20, w + 10);
        context.quadraticCurveTo(10, w + 10, 10, w);
        context.lineTo(10, 20);

        context.quadraticCurveTo(x, 10, 20, 10);
        context.fillStyle = color;
        context.stroke();

        context.fillStyle = color;
        context.fillRect(x + 2, y + 12, w - 3, w - 3)
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
