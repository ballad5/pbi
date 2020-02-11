<template>
  <v-container>
    <v-card>
      <v-card-title>Game Report</v-card-title>
      <v-divider class="mx-4"></v-divider>
      <v-card-text>
        <v-row>
          <v-col class="d-flex" cols="6" sm="6" md="2" lg="2" xl="2">
            <v-select 
              :items="totalSearchTypes"
              label="Report Type"
              v-model="currentTotalSearchType"
              @change="onChangeTotalSearchType"
              outlined
            ></v-select>
          </v-col>
          <v-col class="d-flex" cols="6" sm="6" md="3" lg="3" xl="3">
            <div class="datepicker-trigger">
              <v-text-field
                id="totalSearchDateTrigger"
                label="Selected dates"
                prepend-inner-icon="mdi-calendar-month"
                :value="formatTotalSearchDate"
                single-line
                outlined
                readonly
              ></v-text-field>

              <AirbnbStyleDatepicker
                :trigger-element-id="'totalSearchDateTrigger'"
                :mode="'range'"
                :fullscreen-mobile="true"
                :date-one="currentTotalSearchStart"
                :date-two="currentTotalSearchEnd"
                :end-date="maxSearchDate"
                @date-one-selected="val => { currentTotalSearchStart = val }"
                @date-two-selected="val => { currentTotalSearchEnd = val }"
                @apply="applyTotalSearchDate"
              ></AirbnbStyleDatepicker>
            </div>
          </v-col>
        </v-row>

        <v-simple-table>
          <thead>
            <tr>
              <th>분류</th>
              <th>유형</th>
              <th>총 수익</th>
              <th>DAU</th>
              <th>NRU</th>
              <th>ARPDAU</th>
              <th>ARPPU</th>
              <th>PU%</th>
              <th>NPU</th>
              <th>IAP 수익</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in totalApps" :key="row.app_id">
              <td style="min-width: 150px;">{{ row.app_name }}</td>
              <td style="min-width: 60px;">{{ totalSearchType === 'avg' ? 'AVG' : totalSearchType === 'sum' ? 'SUM' : totalSearchType }}</td>
              <td style="min-width: 87px;">${{ numberWithCommas((row.iap_revenue).toFixed(3)) }}</td>
              <td style="min-width: 75px;">{{ numberWithCommas(parseInt(row.dau)) }}</td>
              <td style="min-width: 75px;">{{ numberWithCommas(parseInt(row.nru)) }}</td>
              <td style="min-width: 92px;">${{ numberWithCommas((row.iap_revenue / row.dau).toFixed(3)) }}</td>
              <td style="min-width: 87px;">${{ row.pu === 0 ? '0' : numberWithCommas((row.iap_revenue / row.pu).toFixed(3)) }}</td>
              <td style="min-width: 90px;">{{ (row.pu / row.dau).toFixed(3) }}%</td>
              <td style="min-width: 78px;">{{ numberWithCommas(row.npu.toFixed(3)) }}</td>
              <td style="min-width: 88px;">${{ numberWithCommas(row.iap_revenue.toFixed(3)) }}</td>
            </tr>
          </tbody>
        </v-simple-table>
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
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import format from 'date-fns/format'
import LineChart from '../components/LineChart.vue'
import 'chartjs-plugin-colorschemes/src/plugins/plugin.colorschemes'
// @ts-ignore
import { SetTwo6 } from 'chartjs-plugin-colorschemes/src/colorschemes/colorschemes.brewer'

@Component({
  components: {
    'line-chart': LineChart
  }
})
export default class Home extends Vue {
  private totalSearchTypes = [{ text: 'AVG', value: 'avg' }, { text: 'SUM', value: 'sum' }]
  private currentTotalSearchType = ''
  private currentTotalSearchStart = new Date()
  private currentTotalSearchEnd = new Date()
  private maxSearchDate = ''
  private dateFormat = 'YYYY-MM-DD'
  private syncing = false

  private get totalSearchType() { return this.$store.getters.totalSearchType || '' }
  private get totalSearchStart() { return this.$store.getters.totalSearchStart || '' }
  private get totalSearchEnd() { return this.$store.getters.totalSearchEnd || '' }
  private get totalApps() { return this.$store.getters.totalSearchData || [] }
  private get dailyData(): any[] { return this.$store.getters.dailyTotalData || [] }
  private get formatTotalSearchDate() {
    return format(this.currentTotalSearchStart, this.dateFormat)
      + ' ~ ' + format(this.currentTotalSearchEnd, this.dateFormat)
  }
  private get revenueChartData() {
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
  private get revenueChartOption() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { tension: 0 } },
      title: { display: true, position: 'top', text: 'Total Revenue' },
      plugins: {
        colorschemes: {
          scheme: SetTwo6
        }
      },
      tooltips: { mode: 'x' },
      legend: { position: 'bottom' }
    }
  }
  private get userChartData() {
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
  private get userChartOption() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { tension: 0 } },
      title: { display: true, position: 'top', text: 'Total User' },
      scales: {
        yAxes: [
          { id: 'DAU', type: 'linear', position: 'left' },
          { id: 'NRU', type: 'linear', position: 'right' }
        ]
      },
      plugins: {
        colorschemes: {
          scheme: SetTwo6
        }
      },
      tooltips: { mode: 'x' },
      legend: { position: 'bottom' }
    }
  }
  private get appsIapChartData() {
    let labels: string[] = []
    const datasets: any[] = []
    for (const [appName, values] of Object.entries(this.$store.getters.dailyAppsIapRevenue)) {
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
  private get appsIapChartOption() {
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
  private get appsDauChartData() {
    let labels: string[] = []
    const datasets: any[] = []
    for (const [appName, values] of Object.entries(this.$store.getters.dailyAppsDau)) {
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
  private get appsDauChartOption() {
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
  private get appsNruChartData() {
    let labels: string[] = []
    const datasets: any[] = []
    for (const [appName, values] of Object.entries(this.$store.getters.dailyAppsNru)) {
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
  private get appsNruChartOption() {
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

  private mounted(): void {
    if (this.totalApps.length > 0) {
      return
    }
    this.getTotalApps()
    const now = Date.now()
    this.maxSearchDate = format(now, this.dateFormat)
  }

  private getTotalApps(): void {
    this.syncing = true
    this.$store.dispatch('GET_TOTAL_APPS')
    .catch((err) => {
      if (err && err.status === 401) {
        this.$store.commit('SIGNOUT')
        this.$router.push('/signin')
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

  private onChangeTotalSearchType() {
    this.$store.commit('CHANGE_TOTAL_SEARCH_TYPE', this.currentTotalSearchType)
    this.getTotalApps()
  }

  private applyTotalSearchDate() {
    this.$store.commit('CHANGE_TOTAL_SEARCH_DATE', {
      start: this.currentTotalSearchStart,
      end: this.currentTotalSearchEnd
    })
    this.getTotalApps()
  }

  private numberWithCommas(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
}
</script>

<style>
.datepicker-trigger { width: 100%; }
#totalSearchDateTrigger { cursor: pointer; }
</style>
