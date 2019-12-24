require('dotenv').config()
import { makeServer } from '@notabug/nab-lmdb-storage'

const LMDB_PATH = process.env.GUN_LMDB_PATH || ''
const LMDB_MAP_SIZE =
  parseInt(process.env.GUN_LMDB_MAP_SIZE || '', 0) || 1024 ** 3

const PORT = parseInt(process.env.GUN_HTTP_PORT || '', 10) || 5555
const HOST = process.env.GUN_HTTP_HOST || '127.0.0.1'

const server = makeServer({
  mapSize: LMDB_MAP_SIZE,
  path: LMDB_PATH
})
// @ts-ignore
server.listen(PORT, HOST)
