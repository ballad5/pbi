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

  const ret = '{"retention_list": {"20191220": {"D_0": {"percent": 100.0, "count": 115}, "D_1": {"percent": 35.65, "count": 41}, "D_2": {"percent": 20.87, "count": 24}, "D_3": {"percent": 20.0, "count": 23}, "D_4": {"percent": 10.43, "count": 12}, "D_5": {"percent": 9.57, "count": 11}, "D_6": {"percent": 10.43, "count": 12}, "D_7": {"percent": 9.57, "count": 11}, "D_8": {"percent": 9.57, "count": 11}, "D_9": {"percent": 7.83, "count": 9}}, "20191221": {"D_0": {"percent": 100.0, "count": 87}, "D_1": {"percent": 40.23, "count": 35}, "D_2": {"percent": 28.74, "count": 25}, "D_3": {"percent": 22.99, "count": 20}, "D_4": {"percent": 18.39, "count": 16}, "D_5": {"percent": 11.49, "count": 10}, "D_6": {"percent": 11.49, "count": 10}, "D_7": {"percent": 16.09, "count": 14}, "D_8": {"percent": 12.64, "count": 11}}, "20191222": {"D_0": {"percent": 100.0, "count": 92}, "D_1": {"percent": 27.17, "count": 25}, "D_2": {"percent": 23.91, "count": 22}, "D_3": {"percent": 25.0, "count": 23}, "D_4": {"percent": 14.13, "count": 13}, "D_5": {"percent": 13.04, "count": 12}, "D_6": {"percent": 8.7, "count": 8}, "D_7": {"percent": 10.87, "count": 10}}, "20191223": {"D_0": {"percent": 100.0, "count": 91}, "D_1": {"percent": 32.97, "count": 30}, "D_2": {"percent": 25.27, "count": 23}, "D_3": {"percent": 21.98, "count": 20}, "D_4": {"percent": 13.19, "count": 12}, "D_5": {"percent": 12.09, "count": 11}, "D_6": {"percent": 19.78, "count": 18}}, "20191224": {"D_0": {"percent": 100.0, "count": 83}, "D_1": {"percent": 31.33, "count": 26}, "D_2": {"percent": 28.92, "count": 24}, "D_3": {"percent": 24.1, "count": 20}, "D_4": {"percent": 20.48, "count": 17}, "D_5": {"percent": 13.25, "count": 11}}}, "msg": "", "start": "20191220", "end": "20191224"}'

  res.send(ret)
}
