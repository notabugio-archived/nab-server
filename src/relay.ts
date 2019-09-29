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
  },

  otherCluster: {
    hostname: process.env.GUN_RELAY_HOST || "notabug.io",
    port: parseInt(process.env.GUN_RELAY_PORT) || 443,
    secure: true,
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
  remoteSocket: any
  webSocket: WebSocketGraphConnector

  constructor(options = DEFAULT_OPTS) {
    this.socket = socketCluster.create(options.socketCluster)
    this.remoteSocket = socketCluster.create(options.otherCluster)

    this.socket.on("error", err => {
      console.error("SC Connection Error", err.stack, err)
    })
    this.remoteSocket.on("error", err => {
      console.error("Remote SC Connection Error", err.stack, err)
    })
    this.sendDiffs()
    this.receiveData()
  }

  sendDiffs() {
    const channel = this.socket.subscribe("gun/put/diff")
    channel.watch(msg => {
      this.remoteSocket.publish("gun/put", msg)
    })
  }

  receiveData() {
    const channel = this.remoteSocket.subscribe("gun/put/diff")
    channel.watch(msg => {
      this.socket.publish("gun/put", msg)
    })
  }
}

new NabRelay()
