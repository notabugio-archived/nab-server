require("dotenv").config()
import path from "path"
import express from "express"
import compression from "compression"
import fallback from "express-history-api-fallback"
import GunSocketClusterWorker from "@notabug/gun-socketcluster-worker"

const staticMedia = express.Router()
const root = path.join(__dirname, "..", "..", "htdocs")
staticMedia.use(express.static(root, { index: false }))

class NotabugWorker extends GunSocketClusterWorker {
  setupExpress() {
    const app = super.setupExpress()
    app.use(compression())
    app.use(staticMedia)
    staticMedia.use(express.static(root, { index: false }))
    app.use(fallback("index.html", { root }))

    return app
  }
}

new NotabugWorker()
