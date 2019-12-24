import { GunGraphAdapter, GunGraphData } from '@chaingun/types'
import { Validation } from '@notabug/nab-wire-validation'
import Gun from 'gun'
import { createAdapter as createBaseAdapter } from './federation'

const suppressor = Validation.createSuppressor(Gun)

export function makeValidationAdapter(
  adapter: GunGraphAdapter,
  validate: (graph: GunGraphData) => Promise<boolean>
): GunGraphAdapter {
  return {
    ...adapter,
    put: (graph: GunGraphData) => {
      return validate(graph).then(isValid => {
        if (isValid) {
          return adapter.put(graph)
        }

        throw new Error('Invalid graph data')
      })
    },
    putSync: undefined
  }
}

export async function validateGraph(graph: GunGraphData): Promise<boolean> {
  return suppressor.validate({
    '#': 'dummymsgid',
    put: graph
  })
}

export function createAdapter(): GunGraphAdapter {
  return makeValidationAdapter(createBaseAdapter(), validateGraph)
}
