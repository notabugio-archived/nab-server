import { WebSocketGraphConnector } from '@notabug/chaingun'
// tslint:disable-next-line: no-implicit-dependencies
import socketCluster from 'socketcluster-client'

const DEFAULT_OPTS = {
  socketCluster: {
    autoReconnect: true,
    hostname: process.env.GUN_SC_HOST || 'localhost',
    port: parseInt(process.env.GUN_SC_PORT, 10) || 4444
  },

  otherCluster: {
    autoReconnect: true,
    autoReconnectOptions: {
      initialDelay: 1,
      maxDelay: 5000,
      randomness: 100
    },
    hostname: process.env.GUN_RELAY_HOST || 'notabug.io',
    port: parseInt(process.env.GUN_RELAY_PORT, 10) || 443,
    secure: true
  }
}

export class NabRelay {
  public readonly socket: any
  public readonly remoteSocket: any
  public readonly webSocket: WebSocketGraphConnector

  constructor(options = DEFAULT_OPTS) {
    this.socket = socketCluster.create(options.socketCluster)
    this.remoteSocket = socketCluster.create(options.otherCluster)

    this.socket.on('error', err => {
      // tslint:disable-next-line: no-console
      console.error('SC Connection Error', err.stack, err)
    })
    this.remoteSocket.on('error', err => {
      // tslint:disable-next-line: no-console
      console.error('Remote SC Connection Error', err.stack, err)
    })
    this.sendDiffs()
    this.receiveData()
  }

  public sendDiffs(): NabRelay {
    const channel = this.socket.subscribe('gun/put/diff')
    channel.watch(msg => {
      this.remoteSocket.publish('gun/put', msg)
    })

    return this
  }

  public receiveData(): NabRelay {
    const channel = this.remoteSocket.subscribe('gun/put/diff')
    channel.watch(msg => {
      this.socket.publish('gun/put', msg)
    })

    return this
  }
}

new NabRelay().sendDiffs().receiveData()
