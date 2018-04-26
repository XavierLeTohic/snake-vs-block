import React from 'react'
export default class extends React.Component {
  static async getInitialProps ({ req, res }) {
    res.setHeader('Content-Type', 'application/json')
    res.write(`
        {
            "name": "Snake-VS-Block",
            "short_name": "Snake VS Block Xavier Le Tohic",
            "start_url": "/",
            "display": "fullscreen",
            "orientation": "portrait",
            "background_color": "#000000",
            "theme_color": "#000000",
            "icons": [
                {
                    "src": "/static/voodoo.png",
                    "sizes": "192x192",
                    "type": "image/png"
                }
            ]
          }
          
    `)
    res.end()
  }
}