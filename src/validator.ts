// tslint:disable-next-line: no-var-requires
require('dotenv').config()
import { NabWireValidator } from '@notabug/nab-wire-validation'

const validator = new NabWireValidator()
validator.validateGets()
validator.validatePuts()
