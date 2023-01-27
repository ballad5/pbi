import format from 'date-fns/format'

export default class State {
  /* common */
  public lastUri: string = '/'
  public token: string = ''
  public account: any = {}
  /* manage */
  public apps: any[] = []
  public adNetworks: any[] = []
  public accounts: any[] = []
  /* data */
  public totalSearchType: string = 'avg'
  public totalSearchStart: string = ''
  public totalSearchEnd: string = ''
  public totalSearchData: any[] = []
  public dailyTotalData: any[] = []
  public dailyAppsIapRevenue: any = {}
  public dailyAppsDau: any = {}
  public dailyAppsNru: any = {}
  /* app */
  public appName: string = ''
  public appBasicData: any[] = []
  public appDailyData: any[] = []
  public appRetentionStart: string = ''
  public appRetentionEnd: string = ''
  public appRetentionList: any = {}
  public appInAppList: any[] = []

  constructor() {
    this.lastUri = localStorage.getItem('last_uri') || '/'
    this.token = localStorage.getItem('signed_token') || ''
    this.account = {}

    const startDate = new Date('2022-12-20T00:00:00')
    const endDate = new Date('2022-12-24T00:00:00')

    this.totalSearchStart = format(startDate, 'YYYY-MM-DD')
    this.totalSearchEnd = format(endDate, 'YYYY-MM-DD')
  }
}
