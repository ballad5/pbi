import { Request } from '../../../@types/request'
import { Response, NextFunction } from 'express'
// import { DB } from '../../../util/db'
// import { Datastores } from '../../../config/datastore'
import { ApiError, ErrorDefine } from '../../../util/error'
import { format } from 'date-fns'
import { StatisticsDailyModel } from '../../../model/statistics-daily'
import isEmpty from 'lodash/isEmpty'

export async function get (req: Request, res: Response, next: NextFunction) {
  if (!req.params.appId) {
    throw new ApiError(ErrorDefine.BAD_REQUEST)
  }
  let { platform, country, from, to } = req.query

  if (isEmpty(from)) {
    from = new Date()
  } else {
    from = from.split('-')
    from = new Date(Number(from[0]), Number(from[1]) - 1, Number(from[2]))
  }
  if (isEmpty(to)) {
    to = new Date()
  } else {
    to = to.split('-')
    to = new Date(Number(to[0]), Number(to[1]) - 1, Number(to[2]))
  }

  const statisticsDailyModel = new StatisticsDailyModel()
  const statisticsDailyData = await statisticsDailyModel.find(Number(req.params.appId), from, to)

  if (!platform) platform = 'all'
  if (!country) country = 'all'
  const now = new Date()
  if (!from) from = format(now.getTime() - (8 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD')
  if (!to) to = format(now.getTime() - (24 * 60 * 60 * 1000), 'YYYY-MM-DD')

  const ret: any = {}
  ret.appName = req.params.appId === '10' ? 'GAME A' : 'GAME B'
  ret.countries = ['KR']
  ret.data = statisticsDailyData

  res.json(ret)
}
