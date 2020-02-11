import { Request as _Request } from 'express'
import { AuthInfo } from './auth-info'

export interface Request extends _Request {
  auth: AuthInfo
}
