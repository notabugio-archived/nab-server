import { FederationAdapter } from '@chaingun/federation-adapter'
import { createGraphAdapter as createHttpAdapter } from '@chaingun/http-adapter'
import createInternalAdapter from '@chaingun/node-adapters'
import { GunGraphAdapter } from '@chaingun/types'
import fs from 'fs'
import yaml from 'js-yaml'

const PEERS_CONFIG_FILE = './peers.yaml'

export function createAdapter(): GunGraphAdapter {
  const internal = createInternalAdapter()
  // tslint:disable-next-line: no-let
  let peersConfigTxt = ''

  try {
    peersConfigTxt = fs.readFileSync(PEERS_CONFIG_FILE).toString()
  } catch (e) {
    // tslint:disable-next-line: no-console
    console.warn('Peers config missing', PEERS_CONFIG_FILE, e.stack)
  }

  const peerUrls = yaml.safeLoad(peersConfigTxt) || []
  const peers: Record<string, GunGraphAdapter> = peerUrls.reduce((pm, url) => {
    return {
      ...pm,
      [url]: createHttpAdapter(`${url}/gun`)
    }
  }, {})
  const adapter = FederationAdapter.create(internal, peers, internal)

  return adapter
}
