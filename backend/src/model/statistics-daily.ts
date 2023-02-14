import { BaseModel, Collection, getRepository, BaseFirestoreRepository } from './base'
import { StatisticsDaily } from '../@types/statistics-daily'

@Collection('statistics_daily')
class StatisticsDailyModel implements StatisticsDaily  {
  id: string
  appId: number
  log_date: number
  dau: number
  nru: number
  iap_revenue: number
  pu: number
  npu: number
}

export class StatisticsDailyRepository extends BaseModel {
  private rep
  constructor () {
    super()    
    this.tableName = 'statistics_daily'
  }

  async init() {
    try {
      this.rep = await getRepository(StatisticsDailyModel)
    } catch (err) {
      throw err
    }
  }

  async findOne (appId: number, log_date: number): Promise<StatisticsDaily> {
    try {
      return await this.rep.whereEqualTo('appId', appId).whereEqualTo('log_date', log_date).findOne()
    } catch (err) {
      throw err
    }
  }

  async find (appId: number, start: number, end: number): Promise<StatisticsDaily> {
    try {
      return await this.rep
      .whereEqualTo('appId', appId)
      .whereGreaterOrEqualThan('log_date', start)
      .whereLessOrEqualThan('log_date', end)
      .find()
    } catch (err) {
      throw err
    }
  }

  async update (item: StatisticsDaily) {
    try {
      await this.rep.update(item)
    } catch (err) {
      throw err
    }
  }
// whereGreaterThan("age",9) "age" > 9
// whereGreaterOrEqualThan "age" >= 9
// WhereLessThan "age" < 9
// whereLessOrEqualThan "age" <= 9
// whereArrayContains
// wherein
// whereArrayContainsAny 
}
