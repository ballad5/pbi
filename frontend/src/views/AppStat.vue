<template>
  <v-container @click="commonStore.offDrawer()">
    <v-card>
      <v-card-title>{{ appName }} - 게임 지표 현황</v-card-title>
      <v-divider class="mx-4"></v-divider>

      <v-card-text>
        <v-row>
          <v-col class="d-flex" cols="6" sm="6" md="2" lg="2" xl="2">
            <v-select 
              :items="platforms"
              item-title="text"
              item-value="value"
              label="PLATFORM"
              v-model="platform"
              @change="onChangeCondition"
              outlined
            ></v-select>
          </v-col>
          <v-col class="d-flex" cols="6" sm="6" md="2" lg="2" xl="2">
            <v-select
              :items="isoCountries"
              item-title="text"
              item-value="value"
              label="COUNTRY"
              v-model="country"
              @change="onChangeCondition"
              outlined
            ></v-select>
          </v-col>
          <v-col class="d-flex" cols="12" md="3">
            <div class="datepicker-trigger">
              <Datepicker v-model="date" range :format="dateFormat" :enable-time-picker="false"
              @update:modelValue="onChangeCondition" ></Datepicker>              
            </div>
          </v-col>
          <v-spacer></v-spacer>
          <v-col class="d-flex justify-end" cols="12" sm="12" md="4" lg="4" xl="4">
            <!-- <v-btn color="primary" @click="tableDialog = true">
              <v-icon left>mdi-table-large</v-icon> Show Table
            </v-btn> -->
            <!-- <download-csv
              :name="formattedToday + '_' + appName + '.csv'"
              :data="csvData"
              class="ml-3"
            >
              <v-btn>
                <v-icon>mdi-download</v-icon>
                Download CSV
              </v-btn>
            </download-csv> -->
          </v-col>
        </v-row>
        <v-divider></v-divider>

        <v-row>
          <v-col class="d-flex" cols="12">
            <line-chart :chartData="dauChartData" :options="dauChartOption" :style="chartStyle"></line-chart>
          </v-col>
        </v-row>
        <v-divider></v-divider>

        <v-row>
          <v-col class="d-flex" cols="12">
            <line-chart :chartData="nruChartData" :options="nruChartOption" :style="chartStyle"></line-chart>
          </v-col>
        </v-row>
        <v-divider></v-divider>

        <v-row>
          <v-col class="d-flex" cols="12">
            <line-chart :chartData="arpdauChartData" :options="arpdauChartOption" :style="chartStyle"></line-chart>
          </v-col>
        </v-row>
        <v-divider></v-divider>

        <v-row>
          <v-col class="d-flex" cols="12">
            <line-chart :chartData="arppuChartData" :options="arppuChartOption" :style="chartStyle"></line-chart>
          </v-col>
        </v-row>
        <v-divider></v-divider>

      </v-card-text>
    </v-card>
    <v-overlay :value="syncing">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script lang="ts">
// import App from 'vue'
import { Component, Vue, Watch } from 'vue-facing-decorator'
import format from 'date-fns/format'
import { LineChart } from 'vue-chart-3'
import { Chart, registerables } from "chart.js"
// @ts-ignore
import { SetTwo6 } from 'chartjs-plugin-colorschemes/src/colorschemes/colorschemes.brewer'
// @ts-ignore
import JsonCSV from 'vue-json-csv'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { dataStore, accountStore, appStore, commonStore } from '@/store'
import { useRouter, useRoute } from 'vue-router'

Chart.register(...registerables)

@Component({
  components: {
    Datepicker,
    LineChart,
    // 'downloadCsv': JsonCSV
  }
})
export default class AppStat extends Vue {
  public dateFormat = 'yyyy-MM-dd'
  public searchStart: string = ''
  public searchEnd: string = ''
  public maxSearchDate: string = ''
  public platform: string = 'all'
  public country: string = 'all'
  public tableDialog: boolean = false
  public syncing = false
  public countries: string[] = []

  private dataStore = dataStore()
  private accountStore = accountStore()
  private appStore = appStore()
  public commonStore = commonStore()

  private route = useRoute()
  private router = useRouter()

  public platforms = [
    { text: 'ALL', value: 'all' }, { text: 'GOOGLE', value: 'android' },
    { text: 'IOS', value: 'ios' }
  ]
  public tableHeaders = [
    { text: 'Date', value: 'log_date', width: '140px' },
    { text: 'Total Revenue', value: 'total_revenue', width: '100px' },
    { text: 'DAU', value: 'dau', sortable: false, width: '80px' },
    { text: 'NRU', value: 'nru', sortable: false, width: '80px' },
    { text: 'ARPDAU', value: 'arpdau', sortable: false, width: '80px' },
    { text: 'ARPPU', value: 'arppu', sortable: false, width: '80px' },
    { text: 'IAP Revenue', value: 'iap_revenue', sortable: false, width: '80px' }
  ]

  public get date() { return [this.searchStart, this.searchEnd] }
  public set date(value : any[]) {   
    this.searchStart = format(new Date(value[0]), this.dateFormat)
    this.searchEnd = format(new Date(value[1]), this.dateFormat)
  }
  public get appName(): string { return this.appStore.getAppName }
  public get appData(): any[] { return this.appStore.getAppBasicData }
  public get isBannerExists(): boolean { return this.appData.some((value) => value.banner_impressions > 0) }
  public get adChartCols(): number { return this.isBannerExists ? 6 : 12 }
  public get isoCountries(): any[] {
    const ret: any[] = [{ text: 'ALL', value: 'all' }]
    if (this.countries.length > 0) {
      this.countries.forEach((row) => {
        if (this.commonStore.isoCountries[row]) {
          ret.push({ text: this.commonStore.isoCountries[row], value: row })
        }
      })
    }
    return ret
  }
  public get formattedToday(): string {
    return format(Date.now(), this.dateFormat)
  }
  public get csvData(): any[] {
    return this.appData.map((row) => {
      const extraData = {
        total_revenue: row.iap_revenue + row.ad_revenue + row.banner_revenue,
        arpdau: row.iap_revenue > 0 ? row.iap_revenue / row.dau : 0,
        arppu: row.pu > 0 ? row.iap_revenue / row.pu : 0
      }
      return Object.assign(row, extraData)
    })
  }
  public get chartStyle(): any {
    return { width: '100%', height: '350px', position: 'relative' }
  }

  public get dauChartData() {
    return {
      labels: this.appData.map((row) => row.log_date),
      datasets: [
        { label: 'DAU', data: this.appData.map((row) => row.dau), fill: false, borderWidth: 2 }
      ]
    }
  }
  public get dauChartOption() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { tension: 0 } },
      plugins: { colorschemes: { scheme: SetTwo6 }
      , title: { display: true, position: 'top', text: 'DAU', fontSize: 16 }, },      
      legend: { display: false }
    }
  }
  public get nruChartData() {
    return {
      labels: this.appData.map((row) => row.log_date),
      datasets: [
        { label: 'NRU', data: this.appData.map((row) => row.nru), fill: false, borderWidth: 2 }
      ]
    }
  }
  public get nruChartOption() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { tension: 0 } },
      plugins: { colorschemes: { scheme: SetTwo6 }, 
      title: { display: true, position: 'top', text: 'NRU', fontSize: 16 }, },      
      legend: { display: false }
    }
  }
  public get revenueChartData() {
    return {
      labels: this.appData.map((row) => row.log_date),
      datasets: [
        {
          label: 'TOTAL',
          data: this.appData.map((row) => row.iap_revenue),
          fill: false,
          borderWidth: 2
        },
        {
          label: 'IAP',
          data: this.appData.map((row) => row.iap_revenue),
          fill: false,
          borderWidth: 2
        }
      ]
    }
  }
  public get revenueChartOption() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { tension: 0 } },
      plugins: { colorschemes: { scheme: SetTwo6 }, 
      title: { display: true, position: 'top', text: 'Revenue', fontSize: 16 }, },
      tooltips: { mode: 'x' },      
      legend: { position: 'bottom' }
    }
  }
  public get arpdauChartData() {
    return {
      labels: this.appData.map((row) => row.log_date),
      datasets: [
        {
          label: 'ARPDAU',
          data: this.appData.map((row) => row.iap_revenue > 0 ? row.iap_revenue / row.dau : 0),
          fill: false,
          borderWidth: 2
        }
      ]
    }
  }
  public get arpdauChartOption() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { tension: 0 } },
      plugins: { colorschemes: { scheme: SetTwo6 }, 
      title: { display: true, position: 'top', text: 'ARPDAU (IAP / DAU)', fontSize: 16 }, },      
      legend: { display: false }
    }
  }
  public get arppuChartData() {
    return {
      labels: this.appData.map((row) => row.log_date),
      datasets: [
        // tslint:disable-next-line:max-line-length
        { label: 'ARPPU', data: this.appData.map((row) => row.pu > 0 ? row.iap_revenue / row.pu : 0), fill: false, borderWidth: 2 }
      ]
    }
  }
  public get arppuChartOption() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { tension: 0 } },
      plugins: { colorschemes: { scheme: SetTwo6 }, 
      title: { display: true, position: 'top', text: 'ARPPU (IAP / PU)', fontSize: 16 }, },      
      legend: { display: false }
    }
  }
  public get puChartData() {
    return {
      labels: this.appData.map((row) => row.log_date),
      datasets: [
        { label: 'PU', data: this.appData.map((row) => row.pu), fill: false, borderWidth: 2 },
        { label: 'NPU', data: this.appData.map((row) => row.npu), fill: false, borderWidth: 2 }
      ]
    }
  }
  public get puChartOption() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { tension: 0 } },
      plugins: { colorschemes: { scheme: SetTwo6 }, 
      title: { display: true, position: 'top', text: 'Paying Users', fontSize: 16 }, },
      tooltips: { mode: 'x' },      
      legend: { display: false }
    }
  }

  private created() {
    const now = Date.now()
    this.searchStart = this.dataStore.getTotalSearchStart
    this.searchEnd = this.dataStore.getTotalSearchEnd
    this.maxSearchDate = format(now, this.dateFormat)
  }

  private mounted(): void {
    this.getData()
  }

  @Watch('$route')
  private onRouteChanged (newValue: any, oldValue: any) {
    if (newValue.params.appId !== oldValue.params.appId) {
      this.getData()
    }
  }

  public getData(): void {
    this.syncing = true
    this.appStore.actionAppBasicData(
      Number(this.route.params.appId),
      this.platform,
      this.country,
      this.searchStart,
      this.searchEnd)    
    .then((data: any) => {
      if (data && data.countries) {
        this.countries = data.countries
      }
    })
    .catch((err) => {
      if (err && err.status === 401) {
        // this.$store.commit('SIGNOUT')
        // this.$router.push('/signin')
        this.accountStore.signOut()
        this.router.push('/signin')
        return
      }
      alert('데이터 로드 실패')
    })
    .finally(() => {
      this.syncing = false
    })
  }

  public onChangeCondition(): void {    
    this.getData()
  }

  get console() { return window.console }
}
</script>

<style scoped>
.datepicker-trigger { width: 100%; }
#searchDateTrigger { cursor: pointer; }
</style>