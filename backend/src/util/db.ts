import { createConnection, PromiseConnection, escapeId } from 'mysql2/promise'
import { Datastore } from '../config/datastore'

export class DB {
  private conn: PromiseConnection
  private datastore: Datastore

  constructor (datastore: Datastore) {
    this.datastore = datastore
  }

  async getConnection (): Promise<PromiseConnection> {
    if (!this.datastore) return null
    if (!this.conn) {
      this.conn = await createConnection(this.datastore)
    }
    return this.conn
  }

  async release (): Promise<void> {
    if (this.conn) {
      await this.conn.end()
      this.conn = null
    }
  }

  async query (sql: string, params?: object | any[]): Promise<any> {
    if (/^update/i.test(sql) && !/where/i.test(sql)) throw new Error('Invalid Update Query')
    const conn = await this.getConnection()
    const query = conn.format(sql, params)
    this._logQuery(query)
    const ret = await conn.query(query)
    return ret
  }

  async insert (table: string, record: any, ignore: boolean = false): Promise<any> {
    const query = 'INSERT' + (ignore ? ' IGNORE' : '') + ' INTO ' + escapeId(table) + ' SET ?'
    const res = await this.query(query, record)
    return res[0].insertId
  }

  async fetchRows (sql: string, params?: object | any[]): Promise<any[]> {
    const queryResult = await this.query(sql, params)
    if (!queryResult[0]) return null
    const data: any[] = queryResult[0]

    const ret = data.map(row => {
      return Object.entries(row).reduce((r, [k, v]) => {
        r[k] = v
        return r
      }, {})
    })

    return ret
  }

  async fetchOne (sql: string, params: object | any[]): Promise<any> {
    const ret = await this.fetchRows(sql, params)
    return (ret) ? ret.shift() : null
  }

  private _logQuery (query): void {
    if (process.env.NODE_ENV === 'local') {
      console.log(query)
    }
  }
}
