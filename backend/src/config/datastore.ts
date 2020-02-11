export interface Datastore {
  host: string
  user: string
  password: string
  database: string
}

export const Datastores = {
  BI: {
    host: 'localhost',
    user: 'team_bi',
    password: '1234',
    database: 'bi'
  }
}
