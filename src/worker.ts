require('dotenv').config()
import GunSocketClusterWorker from '@notabug/gun-socketcluster-worker'
import compression from 'compression'
import express from 'express'
import fallback from 'express-history-api-fallback'
import path from 'path'

const staticMedia = express.Router()
const root = path.join(__dirname, '..', '..', 'htdocs')
staticMedia.use(express.static(root, { index: false }))

class NotabugWorker extends GunSocketClusterWorker {
  public setupExpress() {
    const app = super.setupExpress()
    app.use(compression())
    app.use(staticMedia)
    staticMedia.use(express.static(root, { index: false }))
    app.use(fallback('index.html', { root }))

    return app
  }
}

new NotabugWorker()
