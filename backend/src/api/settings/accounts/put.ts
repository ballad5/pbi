import { Request } from '../../../@types/request'
import { Response, NextFunction } from 'express'
import { ApiError, ErrorDefine } from '../../../util/error'
import { DB } from '../../../util/db'
import { Datastores } from '../../../config/datastore'
import { AuthPrivilege } from '../../../enum-def'

interface RequestBody {
  email: string
  priv: number
}

export async function put (req: Request, res: Response, next: NextFunction) {
  if (req.auth.account.priv < AuthPrivilege.MASTER) {
    throw new ApiError(ErrorDefine.FORBIDDEN)
  }
  const reqBody: RequestBody = req.body

  const db = new DB(Datastores.BI)
  try {
    res.json({ res: 'ok' })
  } catch (err) {
    throw err
  } finally {
    await db.release()
  }
}
