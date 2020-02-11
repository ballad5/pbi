import { Request } from '../../@types/request'
import { Response, NextFunction } from 'express'
import { ApiError, ErrorDefine } from '../../util/error'
import { DB } from '../../util/db'
import { Datastores } from '../../config/datastore'
import { AuthPrivilege } from '../../enum-def'

export async function get (req: Request, res: Response, next: NextFunction) {
  if (req.auth.account.priv < AuthPrivilege.MANAGER) {
    throw new ApiError(ErrorDefine.FORBIDDEN)
  }

  const db = new DB(Datastores.BI)
  try {
    res.json()
  } catch (err) {
    throw err
  } finally {
    await db.release()
  }
}
