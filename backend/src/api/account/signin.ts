import { Request, Response, NextFunction } from 'express'
import { ApiError, ErrorDefine } from '../../util/error'
import https from 'https'
import { sign as jwtSign } from 'jsonwebtoken'
import { AppSecret } from '../../config/secret'
import { DB } from '../../util/db'
import { Datastores } from '../../config/datastore'
import { AuthPrivilege } from '../../enum-def'

export async function postSignIn (req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body
  if (!email || !password) {
    throw new ApiError(ErrorDefine.BAD_REQUEST)
  }

  const account = { email: email, name: 'test', priv: 2 }
  const token = jwtSign({ account: account }, AppSecret.jwtToken, { expiresIn: '7d' })

  res.send({ account: account, token })
}
