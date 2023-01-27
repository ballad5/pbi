import { BaseModel } from './base'
import { StatisticsDaily } from '../@types/statistics-daily'
import { admin, DB } from '../config/firebase'
import { isEmpty } from 'lodash'
import { format, addDays, differenceInDays } from 'date-fns'

export class StatisticsDailyModel extends BaseModel {
  constructor () {
    super()
    this.tableName = 'statistics_daily'
    this.db = DB
    this.querySnapshot = null
  }

  async find (appId: number, startDate: Date, endDate: Date): Promise<StatisticsDaily[]> {

    // let ret: Array<StatisticsDaily>
    let ret = []
    const tbStatisticsDaily = this.db.collection(this.tableName)
    const statisticsDailyData = await tbStatisticsDaily.where('appId', '==', Number(appId)).where('log_date', '>=', startDate).where('log_date', '<=', endDate).get()
    // const statisticsDailyData = await tbStatisticsDaily.where('log_date', '>=', startDate).where('log_date', '<=', endDate).get()
    .then((querySnapshot) => {
      this.querySnapshot = querySnapshot.docs
    }).catch((error) => {
      return false
    })

    // 데이터 없을경우 랜덤으로 넣어줌
    // let dateCount = 0
    // dateCount = differenceInDays(endDate, startDate)
    // if(isEmpty(this.querySnapshot) || 0 != differenceInDays(endDate, startDate)) {
    //   let date = startDate
    //   for(let i = 0 ; i <= dateCount ; i++ ) {
    //     const dateKey = Number(format(date, 'yyyyMMdd'))

    //     const newData: StatisticsDaily = {
    //       appId: appId,
    //       log_date: dateKey,
    //       dau: Math.floor(Math.random() * 100) + 200,
    //       nru: Math.floor(Math.random() * 100) + 1,
    //       iap_revenue: 0,
    //       pu: 0,
    //       npu: 0
    //     }
    //     date = addDays(date, 1)
    //     await this.insert(newData)
    //   }
    // }

    // await this.querySnapshot.forEach((doc) => {
    //   ret = <StatisticsDaily> doc.data()
    //   for(let k in ret) {
    //     console.log(k, '=>', ret[k])
    //   }
    // })

    // 데이터 랜덤으로 만들어 가져옴
    const startDateKey = Number(format(startDate, 'yyyyMMdd'))
    const endDateKey = Number(format(endDate, 'yyyyMMdd'))
    let date = startDate
    for (let i = startDateKey ; i <= endDateKey ;) {
      const dateKey = Number(format(date, 'yyyyMMdd'))
      const pushData: StatisticsDaily = {
        appId: appId,
        log_date: dateKey,
        dau: Math.floor(Math.random() * 100) + 200,
        nru: Math.floor(Math.random() * 100) + 1,
        iap_revenue: 0,
        pu: 0,
        npu: 0
      }
      ret.push(pushData)
      date = addDays(date, 1)
      i = Number(format(date, 'yyyyMMdd'))
    }

    return ret
  }

  async insert (item: StatisticsDaily): Promise<boolean> {

    const tbStatisticsDaily = this.db.collection(this.tableName)
    tbStatisticsDaily.doc().set(item)
    return true
  }

}
