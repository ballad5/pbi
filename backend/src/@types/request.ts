import { Request as _Request } from 'express'
import { AuthInfo } from './auth-info'
import { DbManager } from '../util/db-manager'

export interface Request extends _Request {
  auth: AuthInfo
  dbManager: DbManager
}
