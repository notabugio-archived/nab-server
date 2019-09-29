import WS from "ws"
import socketCluster from "socketcluster-client"
import { WebSocketGraphConnector } from "@notabug/chaingun"

const DEFAULT_OPTS = {
  socketCluster: {
    hostname: process.env.GUN_SC_HOST || "localhost",
    port: parseInt(process.env.GUN_SC_PORT) || 4444,
    autoReconnect: true,
    autoReconnectOptions: {
      initialDelay: 1,
      randomness: 100,
      maxDelay: 500
    }
  }
}

export class NabRelay {
  socket: any
  webSocket: WebSocketGraphConnector

  constructor(options = DEFAULT_OPTS) {
    this.socket = socketCluster.create(options.socketCluster)
    this.socket.on("error", err => {
      console.error("SC Connection Error", err.stack, err)
    })
    this.webSocket = new WebSocketGraphConnector(
      process.env.NAB_WS_URL || "https://notabug.io/gun",
      WS
    )
    this.sendDiffs()
    this.receiveData()
  }

  sendDiffs() {
    const channel = this.socket.subscribe("gun/put/diff")
    channel.watch((diff: any) => {
      this.webSocket.send([diff])
    })
  }

  receiveData() {
    this.webSocket.events.graphData.on((data, id, replyTo) => {
      if (!data) return
      this.socket.publish("gun/put", {
        "#": id,
        "@": replyTo,
        put: data
      })
    })
  }
}

new NabRelay()
