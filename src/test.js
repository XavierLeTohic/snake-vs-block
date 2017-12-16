import React from 'react';
import { render } from 'react-dom';


class App extends React.Component {

  componentDidMount() {
    const canvas = this.canvas;
    const context = canvas.getContext('2d')
    const halfCanvasWidth = canvas.width / 2;
    const halfCanvasHeight = canvas.height / 2;
    let lastCoordinateX;

    // Circles line
    let circles = []


    // Falling points
    let points = []

    let cols = []

    const CIRCLE_RADIUS = 10
    const scale = 2;

    const availableCircle = {
      x: 0,
      y: 0,
      value: 4
    }


    const drawCircle = (centerX, centerY, radius, color) => {
      context.fillStyle = color
      context.beginPath()
      context.arc(centerX, centerY, radius, 0, Math.PI * 2, true)
      context.fill()
    }
    const drawText = (x, y, textSize, color, font, text) => {
      context.font = `normal ${textSize}px ${font}`;
      context.fillStyle = color
      context.fillText(text, x, y);
    }
    const draw = () => {

      // Background
      context.fillStyle = 'black'
      context.fillRect(0, 0, canvas.width, canvas.height)

      // Falling points
      for (var i = 0; i < points.length; i++) {
        drawCircle(
          points[i].x,
          points[i].y,
          CIRCLE_RADIUS * scale,
          `rgb(255, 204, 0)`
        );
        drawText(
          points[i].x - 8,
          points[i].y - 30,
          14 * scale,
          'white',
          'Montserrat-Regular',
          points[i].value)
      }

      // Current available points
      drawText(
        availableCircle.x,
        availableCircle.y,
        14 * scale,
        'white',
        'Montserrat-Regular',
        availableCircle.value)

      // Current circle line  
      for (var j = 0; j < circles.length; i++) {
        drawCircle(
          circles[j].x,
          circles[j].y,
          CIRCLE_RADIUS * scale,
          `rgb(255, 204, 0)`
        );
      }
    }

    const handleTouch = ({ changedTouches }) => {
      const touch = changedTouches[0];

      // First touch
      if (lastCoordinateX === 0) {
        lastCoordinateX = touch.pageX
        return false
      }

      // Check the distance
      const distance = Math.abs(lastCoordinateX - touch.pageX)

      // Swipe left
      if (lastCoordinateX > touch.pageX) {

        if (circles[0].x - distance < CIRCLE_RADIUS) {
          return false
        }

        availableCircle.x -= distance
        circles[0].x -= distance

        circles.map((circle, key) => {
          if (key !== 0) {
            setTimeout(() => {
              circle.x -= distance
            }, 40 * (key / 1.5));
          }
        })
      } else {
        // Swipe right

        if (circles[0].x + distance > ((window.innerWidth * scale) - CIRCLE_RADIUS)) {
          return false
        }

        availableCircle.x += distance
        circles[0].x += distance

        circles.map((circle, key) => {
          if (key !== 0) {

            setTimeout(() => {
              circle.x += distance
            }, 40 * (key / 1.5));
          }
        })
      }

      lastCoordinateX = touch.pageX
    }

    // Add falling points
    const addPoints = () => {

      const numberOfPoints = Math.floor(Math.random() * 4) + 1

      for (var i = 0; i < numberOfPoints; i++) {
        points.push({
          x: cols[i],
          y: - 40,
          value: Math.floor(Math.random() * 5) + 1
        })
      }
    }

    // Update falling points position
    const updatePoints = () => {

      points = points.reduce((previous, point) => {

        // Check if the points y position are upper than canvas height
        if (point.y < (halfCanvasHeight * 2)) {

          // Collision
          if (point.y > (availableCircle.y - 10) && point.y < availableCircle.y + 40
            && point.x > (availableCircle.x - 10) && point.x < availableCircle.x + 40
          ) {

            if (circles.length < 10) {
              circles.push({
                x: circles[circles.length - 1].x,
                y: circles[circles.length - 1].y + 40
              })
            }

            availableCircle.value += point.value;

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


    const oneColWith = halfCanvasWidth / 2;

    cols = [
      oneColWith / 2,
      halfCanvasWidth,
      halfCanvasWidth + oneColWith,
      canvas.width - 50
    ];

    

    availableCircle.x = halfCanvasWidth - (3*scale);
    availableCircle.y = (halfCanvasHeight + (canvas.height / 6)) - 20;

    const defaultX = halfCanvasWidth;
    const defaultY = halfCanvasHeight + (canvas.height / 6);

    for(let i = 0; i < availableCircle.value; i++) {
        circles.push({ x: defaultX, y: defaultY })
    }

    canvas.addEventListener("touchmove", handleTouch, false);

    setInterval(() => {
      updatePoints()
      draw()
    }, 1000 / 60)

    setTimeout(() => {
      addPoints()
      setInterval(() => {
        addPoints()
      }, 1500)
    }, 1000)

  }

  render() {
    return (
      <canvas 
        ref={c => this.canvas = c} 
        height="500"
        width="400"
      />
    )
  }
}

render(<App />, document.getElementById('root'));
