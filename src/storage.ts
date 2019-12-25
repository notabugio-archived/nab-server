// tslint:disable-next-line: no-var-requires
require('dotenv').config()
import { createServer } from '@chaingun/http-server'
import createAdapter from '@chaingun/node-adapters'

const PORT = parseInt(process.env.GUN_HTTP_PORT || '', 10) || 5555
const HOST = process.env.GUN_HTTP_HOST || '127.0.0.1'

const server = createServer(createAdapter())

// @ts-ignore
server.listen(PORT, HOST)
