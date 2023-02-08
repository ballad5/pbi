<template>
  <v-main>
  <v-container>
    <v-card>      
      <v-card-title>Game Report</v-card-title>      
      <v-divider class="mx-4"></v-divider>
      <v-card-text>
        <v-row>          
          <v-col class="d-flex" cols="6" sm="6" md="2" lg="2" xl="2">
            <v-select 
              :items="totalSearchTypes"
              item-title="text"
              item-value="value"
              label="Report Type"
              v-model="currentTotalSearchType"
              @update:modelValue="onChangeTotalSearchType"
              outlined
            ></v-select>
          </v-col>

          <v-col class="d-flex" cols="6" sm="6" md="3" lg="3" xl="3">
            <div class="datepicker-trigger">            
              <Datepicker v-model="date" range :format="dateFormat" :enable-time-picker="false"
              @update:modelValue="applyTotalSearchDate"></Datepicker>              
            </div>
          </v-col>
        </v-row>
        <v-table>
    <thead>
      <tr>
        <th class="text-left">분류</th> 
        <th class="text-left">유형</th>
        <th class="text-left">총 수익</th>
        <th class="text-left">DAU</th>
        <th class="text-left">NRU</th>
        <th class="text-left">ARPDAU</th>
        <th class="text-left">ARPPU</th>
        <th class="text-left">PU%</th>
        <th class="text-left">NPU</th>
        <th class="text-left">IAP 수익</th>
      </tr>
    </thead>
      <tbody>
        <tr v-for="row in totalApps" :key="row.app_id">        
          <td style="min-width: 150px;">{{ row.app_name }}</td>
          <td style="min-width: 60px;">{{ totalSearchType === 'avg' ? 'AVG' : totalSearchType === 'sum' ? 'SUM' : totalSearchType }}</td>
          <td style="min-width: 87px;">${{ numberWithCommas((row.iap_revenue).toFixed(3)) }}</td>
          <td style="min-width: 75px;">{{ numberWithCommas(parseInt(row.dau)) }}</td>
          <td style="min-width: 75px;">{{ numberWithCommas(parseInt(row.nru)) }}</td>
          <td style="min-width: 92px;">${{ numberWithCommas(Number((row.iap_revenue / row.dau).toFixed(3))) }}</td>
          <td style="min-width: 87px;">${{ row.pu === 0 ? '0' : numberWithCommas(Number((row.iap_revenue / row.pu).toFixed(3))) }}</td>
          <td style="min-width: 90px;">{{ (row.pu / row.dau).toFixed(3) }}%</td>
          <td style="min-width: 78px;">{{ numberWithCommas(row.npu.toFixed(3)) }}</td>
          <td style="min-width: 88px;">${{ numberWithCommas(row.iap_revenue.toFixed(3)) }}</td>
        </tr>
      </tbody>  
      </v-table>
      </v-card-text>
    </v-card>
    <v-card class="mt-5">
      <v-card-title>Daily Chart</v-card-title>
      <v-divider class="mx-4"></v-divider>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="12" md="6" lg="6" xl="6">
            <line-chart :chartData="revenueChartData" :options="revenueChartOption"></line-chart>
          </v-col>
          <v-col cols="12" sm="12" md="6" lg="6" xl="6">
            <line-chart :chartData="userChartData" :options="userChartOption"></line-chart>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  
    <v-overlay :value="syncing">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-container>
  </v-main>
</template>

<script lang="ts">
import { LineChart } from 'vue-chart-3'
import { Chart, registerables } from "chart.js"
import { Component, Vue } from 'vue-facing-decorator'
import format from 'date-fns/format'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
// @ts-ignore
import { SetTwo6 } from 'chartjs-plugin-colorschemes/src/colorschemes/colorschemes.brewer'
import { dataStore, accountStore } from '@/store'
import { useRouter, useRoute } from 'vue-router'

Chart.register(...registerables)

@Component({
  components: {
    Datepicker,
    LineChart
  }
})
export default class Home extends Vue {

  public totalSearchTypes = [{ text: 'AVG', value: 'avg' }, { text: 'SUM', value: 'sum' }]
  public currentTotalSearchType = 'AVG'
  public currentTotalSearchStart = new Date()
  public currentTotalSearchEnd = new Date()
  public maxSearchDate = ''
  public dateFormat = 'yyyy-MM-dd'
  public syncing = false

  private dataStore = dataStore()
  private accountStore = accountStore()

  public route = useRoute()
  private router = useRouter()

  public get date() { return [this.currentTotalSearchStart, this.currentTotalSearchEnd] }
  public set date(value : any[]) {   
    this.currentTotalSearchStart = new Date(value[0])
    this.currentTotalSearchEnd = new Date(value[1])
  }
  public get totalSearchType() { return this.dataStore.totalSearchType || '' }
  public get totalSearchStart() { return this.dataStore.totalSearchStart || '' }
  public get totalSearchEnd() { return this.dataStore.totalSearchEnd || '' }
  public get totalApps() { return this.dataStore.totalSearchData || [] }
  public get dailyData(): any[] { return this.dataStore.dailyTotalData || [] }
  public get formatTotalSearchDate() {
    return format(this.currentTotalSearchStart, this.dateFormat)
      + ' ~ ' + format(this.currentTotalSearchEnd, this.dateFormat)
  }
  public get revenueChartData() {
    return {
      labels: this.dailyData.map((row) => row.log_date),
      datasets: [
        {
          label: 'Total',
          fill: false,
          data: this.dailyData.map((row) => row.iap_revenue + row.ad_revenue),
          borderWidth: 2
        },
        {
          label: 'IAP',
          fill: false,
          data: this.dailyData.map((row) => row.iap_revenue),
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
      plugins: {
        colorschemes: {
          scheme: SetTwo6
        },
        title: { display: true, position: 'top', text: 'Total Revenue' },
      },
      tooltips: { mode: 'x' },
      legend: { position: 'bottom' }
    }
  }
  public get userChartData() {
    return {
      labels: this.dailyData.map((row) => row.log_date),
      datasets: [
        {
          label: 'DAU',
          fill: false,
          data: this.dailyData.map((row) => row.dau),
          yAxisID: 'DAU',
          borderWidth: 2
        },
        {
          label: 'NRU',
          fill: false,
          data: this.dailyData.map((row) => row.nru),
          yAxisID: 'NRU',
          borderWidth: 2
        }
      ]
    }
  }
  public get userChartOption() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { tension: 0 } },      
      plugins: {
        colorschemes: {
          scheme: SetTwo6
        },
        title: { display: true, position: 'top', text: 'Total User' },
      },
      tooltips: { mode: 'x' },
      legend: { position: 'bottom' }
    }
  }
  public get appsIapChartData() {
    let labels: string[] = []
    const datasets: any[] = []
    for (const [appName, values] of Object.entries(this.dataStore.dailyAppsIapRevenue)) {
      // @ts-ignore
      const rowLabels = values.map((row) => row.date)
      labels = labels.length < rowLabels.length ? rowLabels : labels
      datasets.push({
        label: appName,
        fill: false,
        // @ts-ignore
        data: values.map((row) => {
          return { x: row.date, y: row.value }
        }),
        borderWidth: 2
      })
    }
    return { labels, datasets }
  }
  public get appsIapChartOption() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      title: { display: true, position: 'top', text: 'Apps IAP Revenue' },
      elements: { line: { tension: 0 } },
      plugins: {
        colorschemes: {
          scheme: SetTwo6
        }
      },
      tooltips: { mode: 'x' },
      legend: { position: 'bottom' }
    }
  }
  public get appsDauChartData() {
    let labels: string[] = []
    const datasets: any[] = []
    for (const [appName, values] of Object.entries(this.dataStore.dailyAppsDau)) {
      // @ts-ignore
      const rowLabels = values.map((row) => row.date)
      labels = labels.length < rowLabels.length ? rowLabels : labels
      datasets.push({
        label: appName,
        fill: false,
        // @ts-ignore
        data: values.map((row) => {
          return { x: row.date, y: row.value }
        }),
        borderWidth: 2
      })
    }
    return { labels, datasets }
  }
  public get appsDauChartOption() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { tension: 0 } },
      title: { display: true, position: 'top', text: 'Apps DAU' },
      plugins: {
        colorschemes: {
          scheme: SetTwo6
        }
      },
      tooltips: { mode: 'x' },
      legend: { position: 'bottom' }
    }
  }
  public get appsNruChartData() {
    let labels: string[] = []
    const datasets: any[] = []
    for (const [appName, values] of Object.entries(this.dataStore.dailyAppsNru)) {
      // @ts-ignore
      const rowLabels = values.map((row) => row.date)
      labels = labels.length < rowLabels.length ? rowLabels : labels
      datasets.push({
        label: appName,
        fill: false,
        // @ts-ignore
        data: values.map((row) => {
          return { x: row.date, y: row.value }
        }),
        borderWidth: 2
      })
    }
    return { labels, datasets }
  }
  public get appsNruChartOption() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { tension: 0 } },
      title: { display: true, position: 'top', text: 'Apps NRU' },
      plugins: {
        colorschemes: {
          scheme: SetTwo6
        }
      },
      tooltips: { mode: 'x' },
      legend: { position: 'bottom' }
    }
  }

  public mounted(): void {
    if (this.totalApps.length > 0) {
      return
    }
    this.getTotalApps()
    const now = Date.now()
    this.maxSearchDate = format(now, this.dateFormat)
  }

  public getTotalApps(): void {
    this.syncing = true
    this.dataStore.getTotalApps()
    .catch((err) => {
      if (err && err.status === 401) {
        this.accountStore.signOut()
        this.router.push('/signin')
        return
      }
      alert('데이터 로드 실패')
    })
    .then(() => {
      this.currentTotalSearchType = this.totalSearchType
      this.currentTotalSearchStart = new Date(this.totalSearchStart)
      this.currentTotalSearchEnd = new Date(this.totalSearchEnd)      
    })
    .finally(() => {
      this.syncing = false
    })
  }

  public onChangeTotalSearchType() {
    this.dataStore.changeTotalSearchType(this.currentTotalSearchType)
    this.getTotalApps()
  }

  public applyTotalSearchDate(modelData: string[]) {
    this.dataStore.changeTotalSearchDate(format(new Date(modelData[0]), this.dateFormat),
    format(new Date(modelData[1]), this.dateFormat))
    this.getTotalApps()
  }

  public numberWithCommas(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
}
</script>

<style>
.datepicker-trigger { width: 100%; }
#totalSearchDateTrigger { cursor: pointer; }
</style>
