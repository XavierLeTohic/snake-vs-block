
import { Component } from 'react'
import Head from 'next/head'
import Game from '../src/game'

export default class extends Component {

    componentDidMount() {
        // Client-side
        if(typeof window !== 'undefined') {
            const game = new Game(this.canvas)
        }
    }

    render() {
        return (
            <div className="gameContainer">
                <Head>
                    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                    <link rel="preload" href="/static/fonts/Montserrat-Light.ttf" as="font" />
                    <link rel="preload" href="/static/fonts/Montserrat-Thin.ttf" as="font" />
                </Head>
                <canvas
                    ref={c => this.canvas = c}
                    height="450"
                    width="600"
                />

                <style jsx global>
                    {`
                        html, body {
                            height: 100vh;
                            margin: 0;
                            overflow: hidden;
                            background-color: black;
                        }

                        .gameContainer {
                            height: 100vh;
                        }

                        @font-face {
                            font-family: "Montserrat-Regular";
                            src: url("/static/fonts/Montserrat-Regular.ttf") format("truetype")
                        }
                        @font-face {
                            font-family: "Montserrat-Light";
                            src: url("/static/fonts/Montserrat-Light.ttf") format("truetype")
                        }
                        @font-face {
                            font-family: "Montserrat-Thin";
                            src: url("/static/fonts/Montserrat-Thin.ttf") format("truetype")
                        }
                    `}
                </style>
            </div>
        )
    }
}