import React from 'react'
export default class extends React.Component {
  static async getInitialProps ({ req, res }) {
    res.setHeader('Content-Type', 'application/json')
    res.write(`
        {
            "short_name": "Snake VS Block",
            "name": "Snake VS Block by Xavier Le Tohic - Voodoo",
            "icons": [
                {
                    "src": "/static/voodoo.png",
                    "sizes": "192x192",
                    "type": "image/png"
                }
            ],
            "start_url": "/dist/index.html",
            "display": "fullscreen",
            "orientation": "portrait"
        }
    `)
    res.end()
  }
}