import { Request, Response, NextFunction } from 'express'
import { ApiError, ErrorDefine } from '../../util/error'
import { SearchType } from '../../enum-def'
import { format, compareAsc } from 'date-fns'
import { DB } from '../../util/db'
import { Datastores } from '../../config/datastore'

export async function get (req: Request, res: Response, next: NextFunction) {
  let { type, from, to } = req.query
  const now = new Date()
  if (!type) type = SearchType.AVG
  if (!from) from = format(now.getTime() - (8 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD')
  if (!to) to = format(now.getTime() - (24 * 60 * 60 * 1000), 'YYYY-MM-DD')
  if (compareAsc(from, to) > 0 || (type !== SearchType.AVG && type !== SearchType.SUM)) {
    throw new ApiError(ErrorDefine.BAD_REQUEST)
  }

  const db = new DB(Datastores.BI)
  try {
    let func = type === SearchType.AVG ? 'AVG' : 'SUM'

    const summaries = []
    if (type === SearchType.AVG) {
      summaries.push({ app_id: 10, app_name: 'GAME A',
        list_order: 9, dau: '472.2000', nru: '93.6000', pu: '0.8000', npu: '0.6000', iap_revenue: 3.992 })
      summaries.push({ app_id: 14, app_name: 'GAME B', list_order: 104, dau: '405.4000', nru: '0.6000', pu: '0.8000', npu: '0.6000', iap_revenue: 6.587999999999999 })
    } else {
      summaries.push({ app_id: 10, app_name: 'GAME A', list_order: 9, dau: 2361, nru: 468, pu: 4, npu: 3, iap_revenue: 19.96 })
      summaries.push({ app_id: 14, app_name: 'GAME B', list_order: 104, dau: 2027, nru: 643, pu: 3, npu: 3, iap_revenue: 32.94 })
    }

    const total = { app_id: 0, app_name: 'Total', list_order: 0, dau: 0, nru: 0, pu: 0, npu: 0, iap_revenue: 0, ad_revenue: 0, impressions: 0 }
    for (const row of summaries) {
      row.dau = Number(row.dau)
      row.nru = Number(row.nru)
      row.pu = Number(row.pu)
      row.npu = Number(row.npu)
      row.iap_revenue = Number(row.iap_revenue)

      total.dau += row.dau
      total.nru += row.nru
      total.pu += row.pu
      total.npu += row.npu
      total.iap_revenue += row.iap_revenue
    }
    summaries.push(total)

    const dailyData = [{ log_date: 20191220, dau: 868, nru: 250, iap_revenue: 0 },
                        { log_date: 20191221, dau: 889, nru: 202, iap_revenue: 897 },
                        { log_date: 20191222, dau: 890, nru: 227, iap_revenue: 399 },
                        { log_date: 20191223, dau: 872, nru: 216, iap_revenue: 1398 },
                        { log_date: 20191224, dau: 869, nru: 216, iap_revenue: 2596 }]
    dailyData.forEach(value => {
      value.dau = Number(value.dau)
      value.nru = Number(value.nru)
      value.iap_revenue = Number(value.iap_revenue)
    })

    const dailyApps = [{ log_date: 20191220, app_id: 10, app_name: 'GAME A', list_order: 9, dau: 503, nru: 115, iap_revenue: 0 },
    { log_date: 20191220, app_id: 14, app_name: 'GAME B', list_order: 104, dau: 365, nru: 135, iap_revenue: 0 },
    { log_date: 20191221, app_id: 10, app_name: 'GAME A', list_order: 9, dau: 510, nru: 87, iap_revenue: 5.98 },
    { log_date: 20191221, app_id: 14, app_name: 'GAME B', list_order: 104, dau: 379, nru: 115, iap_revenue: 2.99 },
    { log_date: 20191222, app_id: 10, app_name: 'GAME A', list_order: 9, dau: 466, nru: 92, iap_revenue: 3.99 },
    { log_date: 20191222, app_id: 14, app_name: 'GAME B', list_order: 104, dau: 424, nru: 135, iap_revenue: 0 },
    { log_date: 20191223, app_id: 10, app_name: 'GAME A', list_order: 9, dau: 456, nru: 91, iap_revenue: 9.99 },
    { log_date: 20191223, app_id: 14, app_name: 'GAME B', list_order: 104, dau: 416, nru: 125, iap_revenue: 3.99 },
    { log_date: 20191224, app_id: 10, app_name: 'GAME A', list_order: 9, dau: 426, nru: 83, iap_revenue: 0 },
    { log_date: 20191224, app_id: 14, app_name: 'GAME B', list_order: 104, dau: 443, nru: 133, iap_revenue: 29.3391 }]

    res.json({ summaries, dailyData, dailyApps })
  } catch (err) {
    throw err
  } finally {
    await db.release()
  }
}
