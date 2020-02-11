<template>
  <v-container>
    <v-card>
      <v-card-title>{{ appName }} - 게임 지표 현황</v-card-title>
      <v-divider class="mx-4"></v-divider>

      <v-card-text>
        <v-row>
          <v-col class="d-flex" cols="6" sm="6" md="2" lg="2" xl="2">
            <v-select 
              :items="platforms"
              label="PLATFORM"
              v-model="platform"
              @change="onChangeCondition"
              outlined
            ></v-select>
          </v-col>
          <v-col class="d-flex" cols="6" sm="6" md="2" lg="2" xl="2">
            <v-select
              :items="isoCountries"
              label="COUNTRY"
              v-model="country"
              @change="onChangeCondition"
              outlined
            ></v-select>
          </v-col>
          <v-col class="d-flex" cols="12" md="3">
            <div class="datepicker-trigger">
              <v-text-field
                id="searchDateTrigger"
                label="Selected dates"
                prepend-inner-icon="mdi-calendar-month"
                :value="formatSearchDate"
                single-line
                outlined
                readonly
              ></v-text-field>

              <AirbnbStyleDatepicker
                :trigger-element-id="'searchDateTrigger'"
                :mode="'range'"
                :fullscreen-mobile="true"
                :date-one="searchStart"
                :date-two="searchEnd"
                :end-date="maxSearchDate"
                @date-one-selected="val => { searchStart = val }"
                @date-two-selected="val => { searchEnd = val }"
                @apply="onChangeCondition"
              ></AirbnbStyleDatepicker>
            </div>
          </v-col>
          <v-spacer></v-spacer>
          <v-col class="d-flex justify-end" cols="12" sm="12" md="4" lg="4" xl="4">
            <v-btn color="primary" @click="tableDialog = true">
              <v-icon left>mdi-table-large</v-icon> Show Table
            </v-btn>
            <download-csv
              :name="formattedToday + '_' + appName + '.csv'"
              :data="csvData"
              class="ml-3"
            >
              <v-btn>
                <v-icon>mdi-download</v-icon>
                Download CSV
              </v-btn>
            </download-csv>
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

    <v-dialog v-model="tableDialog" fullscreen hide-overlay>
      <v-card>
        <v-toolbar dark color="primary">
          {{ appName }} - Daily Data
          <div class="flex-grow-1"></div>
          <v-btn icon dark @click="tableDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="mt-5">
          <v-data-table
            :headers="tableHeaders"
            :items="csvData"
            :items-per-page="15"
            class="elevation-1"
          >
            <template v-slot:item.total_revenue="{ item }">
              {{ item.total_revenue.toLocaleString() }}
            </template>
            <template v-slot:item.dau="{ item }">
              {{ item.dau.toLocaleString() }}
            </template>
            <template v-slot:item.nru="{ item }">
              {{ item.nru.toLocaleString() }}
            </template>
            <template v-slot:item.arpdau="{ item }">
              {{ item.arpdau.toLocaleString() }}
            </template>
            <template v-slot:item.arppu="{ item }">
              {{ item.arppu.toLocaleString() }}
            </template>
            <template v-slot:item.iap_revenue="{ item }">
              {{ item.iap_revenue.toLocaleString() }}
            </template>           
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-overlay :value="syncing">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import format from 'date-fns/format'
import LineChart from '../components/LineChart.vue'
import 'chartjs-plugin-colorschemes/src/plugins/plugin.colorschemes'
// @ts-ignore
import { SetTwo6 } from 'chartjs-plugin-colorschemes/src/colorschemes/colorschemes.brewer'
// @ts-ignore
import JsonCSV from 'vue-json-csv'

@Component({
  components: {
    'line-chart': LineChart,
    'downloadCsv': JsonCSV
  }
})
export default class AppStat extends Vue {
  private dateFormat: string = 'YYYY-MM-DD'
  private searchStart: string = ''
  private searchEnd: string = ''
  private maxSearchDate: string = ''
  private platform: string = 'all'
  private country: string = 'all'
  private tableDialog: boolean = false
  private syncing = false
  private countries: string[] = []

  private platforms = [
    { text: 'ALL', value: 'all' }, { text: 'GOOGLE', value: 'android' },
    { text: 'IOS', value: 'ios' }
  ]
  private tableHeaders = [
    { text: 'Date', value: 'log_date', width: '140px' },
    { text: 'Total Revenue', value: 'total_revenue', width: '100px' },
    { text: 'DAU', value: 'dau', sortable: false, width: '80px' },
    { text: 'NRU', value: 'nru', sortable: false, width: '80px' },
    { text: 'ARPDAU', value: 'arpdau', sortable: false, width: '80px' },
    { text: 'ARPPU', value: 'arppu', sortable: false, width: '80px' },
    { text: 'IAP Revenue', value: 'iap_revenue', sortable: false, width: '80px' }
  ]

  private get appName(): string { return this.$store.getters.appName }
  private get appData(): any[] { return this.$store.getters.appBasicData }
  private get isBannerExists(): boolean { return this.appData.some((value) => value.banner_impressions > 0) }
  private get adChartCols(): number { return this.isBannerExists ? 6 : 12 }
  private get isoCountries(): any[] {
    const ret: any[] = [{ text: 'ALL', value: 'all' }]
    if (this.countries.length > 0) {
      this.countries.forEach((row) => {
        if (this.$store.getters.isoCountries[row]) {
          ret.push({ text: this.$store.getters.isoCountries[row], value: row })
        }
      })
    }
    return ret
  }
  private get formatSearchDate(): string {
    return format(this.searchStart, this.dateFormat)
      + ' ~ ' + format(this.searchEnd, this.dateFormat)
  }
  private get formattedToday(): string {
    return format(Date.now(), this.dateFormat)
  }
  private get csvData(): any[] {
    return this.appData.map((row) => {
      const extraData = {
        total_revenue: row.iap_revenue + row.ad_revenue + row.banner_revenue,
        arpdau: row.iap_revenue > 0 ? row.iap_revenue / row.dau : 0,
        arppu: row.pu > 0 ? row.iap_revenue / row.pu : 0
      }
      return Object.assign(row, extraData)
    })
  }
  private get chartStyle(): any {
    return { width: '100%', height: '350px', position: 'relative' }
  }

  private get dauChartData() {
    return {
      labels: this.appData.map((row) => row.log_date),
      datasets: [
        { label: 'DAU', data: this.appData.map((row) => row.dau), fill: false, borderWidth: 2 }
      ]
    }
  }
  private get dauChartOption() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { tension: 0 } },
      plugins: { colorschemes: { scheme: SetTwo6 } },
      title: { display: true, position: 'top', text: 'DAU', fontSize: 16 },
      legend: { display: false }
    }
  }
  private get nruChartData() {
    return {
      labels: this.appData.map((row) => row.log_date),
      datasets: [
        { label: 'NRU', data: this.appData.map((row) => row.nru), fill: false, borderWidth: 2 }
      ]
    }
  }
  private get nruChartOption() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { tension: 0 } },
      plugins: { colorschemes: { scheme: SetTwo6 } },
      title: { display: true, position: 'top', text: 'NRU', fontSize: 16 },
      legend: { display: false }
    }
  }
  private get revenueChartData() {
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
  private get revenueChartOption() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { tension: 0 } },
      plugins: { colorschemes: { scheme: SetTwo6 } },
      tooltips: { mode: 'x' },
      title: { display: true, position: 'top', text: 'Revenue', fontSize: 16 },
      legend: { position: 'bottom' }
    }
  }
  private get arpdauChartData() {
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
  private get arpdauChartOption() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { tension: 0 } },
      plugins: { colorschemes: { scheme: SetTwo6 } },
      title: { display: true, position: 'top', text: 'ARPDAU (IAP / DAU)', fontSize: 16 },
      legend: { display: false }
    }
  }
  private get arppuChartData() {
    return {
      labels: this.appData.map((row) => row.log_date),
      datasets: [
        // tslint:disable-next-line:max-line-length
        { label: 'ARPPU', data: this.appData.map((row) => row.pu > 0 ? row.iap_revenue / row.pu : 0), fill: false, borderWidth: 2 }
      ]
    }
  }
  private get arppuChartOption() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { tension: 0 } },
      plugins: { colorschemes: { scheme: SetTwo6 } },
      title: { display: true, position: 'top', text: 'ARPPU (IAP / PU)', fontSize: 16 },
      legend: { display: false }
    }
  }
  private get puChartData() {
    return {
      labels: this.appData.map((row) => row.log_date),
      datasets: [
        { label: 'PU', data: this.appData.map((row) => row.pu), fill: false, borderWidth: 2 },
        { label: 'NPU', data: this.appData.map((row) => row.npu), fill: false, borderWidth: 2 }
      ]
    }
  }
  private get puChartOption() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { tension: 0 } },
      plugins: { colorschemes: { scheme: SetTwo6 } },
      tooltips: { mode: 'x' },
      title: { display: true, position: 'top', text: 'Paying Users', fontSize: 16 },
      legend: { display: false }
    }
  }

  private created() {
    const now = Date.now()
    this.searchStart = this.$store.getters.totalSearchStart
    this.searchEnd = this.$store.getters.totalSearchEnd
    this.maxSearchDate = format(now, this.dateFormat)
  }

  private mounted(): void {
    this.getData()
  }

  @Watch('$route')
  private onRouteChanged(newValue: any, oldValue: any) {
    if (newValue.params.appId !== oldValue.params.appId) {
      this.getData()
    }
  }

  private getData(): void {
    this.syncing = true
    this.$store.dispatch('GET_APP_BASIC_DATA', {
      appId: this.$route.params.appId,
      platform: this.platform,
      country: this.country,
      from: this.searchStart,
      to: this.searchEnd
    })
    .then((data) => {
      if (data && data.countries) {
        this.countries = data.countries
      }
    })
    .catch((err) => {
      if (err && err.status === 401) {
        this.$store.commit('SIGNOUT')
        this.$router.push('/signin')
        return
      }
      alert('데이터 로드 실패')
    })
    .finally(() => {
      this.syncing = false
    })
  }

  private onChangeCondition(): void {
    this.getData()
  }

  get console() { return window.console }
}
</script>

<style scoped>
.datepicker-trigger { width: 100%; }
#searchDateTrigger { cursor: pointer; }
</style>