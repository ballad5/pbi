import { Request } from '../../../@types/request'
import { StatisticsDaily } from '../../../@types/statistics-daily'
import { Response, NextFunction } from 'express'
import { ApiError, ErrorDefine } from '../../../util/error'
import { parse, format, addDays } from 'date-fns'
import { StatisticsDailyRepository } from '../../../model/statistics-daily'
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

  const statisticsDailyModel = new StatisticsDailyRepository()
  await statisticsDailyModel.init()
  const statisticsDailyData = await statisticsDailyModel.find(
    Number(req.params.appId), Number(format(from, 'yyyyMMdd')), Number(format(to, 'yyyyMMdd')))

  if (!platform) platform = 'all'
  if (!country) country = 'all'
  const now = new Date()
  if (!from) from = format(now.getTime() - (8 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD')
  if (!to) to = format(now.getTime() - (24 * 60 * 60 * 1000), 'YYYY-MM-DD')

  const ret: any = {}
  ret.appName = req.params.appId === '10' ? 'GAME A' : 'GAME B'
  ret.countries = ['KR']
  ret.data = await getFakeData(Number(req.params.appId),
    Number(format(from, 'yyyyMMdd')), Number(format(to, 'yyyyMMdd')))

  res.json(ret)
}

async function getFakeData (appId, from, to): Promise<any> {
  const diffDay = Number(to) - Number(from)
  const data = []
  for (let i = Number(from) ; i <= Number(to) ; i ++) {
    const tmp: StatisticsDaily = {
      id: '',
      appId: appId,
      log_date: i,
      dau: Math.floor(Math.random() * 100) + 200,
      nru: Math.floor(Math.random() * 90) + 10,
      iap_revenue: 0,
      pu: 0,
      npu: 0
    }

    data.push(tmp)
  }
  return data
}
