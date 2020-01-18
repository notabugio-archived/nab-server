import {
  ChainGunSeaClient,
  GunGraph,
  GunGraphConnectorFromAdapter,
  GunNode,
  pubFromSoul,
  unpackNode
} from '@chaingun/sea-client'
import { Query } from '@notabug/peer'
import { NotabugWorker } from './worker'

export class NotabugClient extends ChainGunSeaClient {
  public readonly worker: NotabugWorker

  constructor(worker: NotabugWorker) {
    const graph = new GunGraph()
    const dbConnector = new GunGraphConnectorFromAdapter(worker.adapter)

    dbConnector.sendRequestsFromGraph(graph as any)
    dbConnector.sendPutsFromGraph(graph as any)
    graph.connect(dbConnector)

    super({ graph })

    this.worker = worker
    this.readNode = this.readNode.bind(this)
  }

  public authenticate(): Promise<{
    readonly alias: string
    readonly pub: string
  }> {
    if (process.env.GUN_ALIAS && process.env.GUN_PASSWORD && !this.user().is) {
      return this.user().auth(process.env.GUN_ALIAS, process.env.GUN_PASSWORD)
    }

    return Promise.reject(new Error('Missing GUN_ALIAS or GUN_PASSWORD'))
  }

  public readNode(
    soul: string,
    from: 'internal' | 'external' = 'internal'
  ): Promise<GunNode | null> {
    return new Promise<GunNode | null>((ok, fail) => {
      const timeout = setTimeout(() => fail(new Error('Read timeout')), 60000)

      function done(val: any): void {
        clearTimeout(timeout)
        ok(val)
      }

      // tslint:disable-next-line: no-unused-expression
      ;(from === 'internal' ? this.worker.internalAdapter : this.worker.adapter)
        .get(soul)
        .then(node => {
          if (pubFromSoul(soul)) {
            unpackNode(node, 'mutable')
          }

          done(node)
        })
    })
  }

  public newScope(): any {
    return Query.createScope(
      { gun: this },
      {
        getter: this.readNode,
        unsub: true
      }
    )
  }
}
