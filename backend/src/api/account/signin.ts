import { Request } from '../../@types/request'
import { Response, NextFunction } from 'express'
import { ApiError, ErrorDefine } from '../../util/error'
import https from 'https'
import { sign as jwtSign } from 'jsonwebtoken'
import { AppSecret, createHashedPassword, verifyPassword } from '../../config/secret'
import { AdminUserModel } from '../../model/admin-user'

export async function postSignIn (req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body
  if (!email || !password) {
    throw new ApiError(ErrorDefine.BAD_REQUEST)
  }

  const account = { email: email, name: 'test' }
  const token = jwtSign({ account: account }, AppSecret.jwtToken, { expiresIn: '7d' })

  const adminUserModel = new AdminUserModel()
  const adminUserInfo = await adminUserModel.findOne(email)

  const result = await verifyPassword(password, adminUserInfo.salt, adminUserInfo.password)
  if (result) {
    console.log(result)
    adminUserInfo.date_mod = Date.now()
    await adminUserModel.update(adminUserInfo)
  } else {
    throw new ApiError(ErrorDefine.INTERNAL_SERVER_ERROR)
  }

  res.send({ account: account, token })
}
