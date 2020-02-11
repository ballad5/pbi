import { Request, Response, NextFunction } from 'express'
import { DB } from '../../../util/db'
import { Datastores } from '../../../config/datastore'
import { ApiError, ErrorDefine } from '../../../util/error'
import { format } from 'date-fns'

export async function get (req: Request, res: Response, next: NextFunction) {
  if (!req.params.appId) {
    throw new ApiError(ErrorDefine.BAD_REQUEST)
  }
  let { platform, country, from, to } = req.query
  if (!platform) platform = 'all'
  if (!country) country = 'all'
  const now = new Date()
  if (!from) from = format(now.getTime() - (8 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD')
  if (!to) to = format(now.getTime() - (24 * 60 * 60 * 1000), 'YYYY-MM-DD')
  const numFrom = parseInt(from.replace(/\-/g, ''), 10)
  const numTo = parseInt(to.replace(/\-/g, ''), 10)

  const ret: any = {}
  ret.appName = req.params.appId === '10' ? 'GAME A' : 'GAME B'
  ret.countries = ['KR']
  ret.data = [{ log_date: 20191220, dau: 225, nru: 78, iap_revenue: 0, pu: 0, npu: 0 },
              { log_date: 20191221, dau: 246, nru: 77, iap_revenue: 0, pu: 0, npu: 0 },
              { log_date: 20191222, dau: 227, nru: 75, iap_revenue: 0, pu: 0, npu: 0 },
              { log_date: 20191223, dau: 264, nru: 72, iap_revenue: 0, pu: 0, npu: 0 },
              { log_date: 20191224, dau: 241, nru: 71, iap_revenue: 0, pu: 0, npu: 0 }]

  res.json(ret)
}
