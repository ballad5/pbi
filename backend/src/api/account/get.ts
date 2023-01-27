import { Request, Response, NextFunction } from 'express'
import { verify, sign } from 'jsonwebtoken'
import { AppSecret } from '../../config/secret'
import { ApiError, ErrorDefine } from '../../util/error'

export async function get (req: Request, res: Response, next: NextFunction) {
  try {
    const authValue = req.header('Authorization')
    let token = authValue.substring(7)
    const decoded : any = verify(token, AppSecret.jwtToken)
    if (decoded.exp <= Math.floor(Date.now() / 1000) + 24 * 60 * 60) {
      token = sign({ account: decoded.account }, AppSecret.jwtToken, { expiresIn: '7d' })
    }
    if (!decoded.account) {
      throw new ApiError(ErrorDefine.INTERNAL_SERVER_ERROR)
    }
    res.json({ token, account: decoded.account })
  } catch (err) {
    throw err
  }
}
