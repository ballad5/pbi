<template>
  <v-container class="white">
    <v-row class="display-1">
      <v-col cols="12">
        {{ appName }} - Retention
      </v-col>
    </v-row>

    <v-row>
      <v-col class="d-flex" cols="12" md="3">
        <v-select 
          :items="platforms"
          label="platform"
          v-model="alias"
          @change="onChangeCondition"
          outlined
          dense
        ></v-select>
        <v-select
          :items="isoCountries"
          label="country"
          v-model="country"
          @change="onChangeCondition"
          class="ml-2"
          outlined
          dense
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
            dense
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
      <v-col cols="12" md="4" class="body-2 d-flex justify-end">
        <v-radio-group v-model="displayType" row dense>
          <v-radio label="접속 % + 유저 수" value="both"></v-radio>
          <v-radio label="유저 수" value="count"></v-radio>
          <v-radio label="접속 %" value="percent"></v-radio>
        </v-radio-group>
      </v-col>
    </v-row>
    <v-divider></v-divider>

    <v-row>
      <v-col cols="12" class="d-flex justify-end">
        <v-btn small @click="doCopy">Copy</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <template v-if="list">
          <v-simple-table class="table-collapse">
            <thead>
              <tr class="light-blue lighten-5">
                <th></th>
                <th class="text-center" v-for="item in listHeaders" :key="item">{{ item.replace('_', '-') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, key) in list" :key="key">
                <td class="text-center">{{ key }}</td>
                  <!-- {{ console.log(displayType) }} -->
                <td class="text-center" v-for="(data, dataKey) in item" :key="dataKey" :style="cellColor(data.percent)">
                  <template v-if="displayType === 'both'">
                    {{ data.percent }}%<br>{{ data.count }}
                  </template>
                  <template v-else-if="displayType === 'count'">
                    {{ data.count }}
                  </template>
                  <template v-else>
                    {{ data.percent }}%
                  </template>
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </template>
      </v-col>
    </v-row>

    <v-overlay :value="syncing">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import format from 'date-fns/format'
import uniq from 'lodash.uniq'

@Component({})
export default class Retention extends Vue {
  private syncing: boolean = false
  private dateFormat: string = 'YYYY-MM-DD'
  private alias: string = 'mobile'
  private country: string = 'ALL'
  private searchStart: string = ''
  private searchEnd: string = ''
  private maxSearchDate: string = ''
  private platforms = [
    { text: 'ALL', value: 'mobile' }, { text: 'GOOGLE', value: 'mobile_android' }
  ]
  private countries: string[] = []
  private displayType: string = 'both'

  private get appName(): string { return this.$store.getters.appName }
  private get isoCountries(): any[] {
    const ret: any[] = [{ text: 'ALL', value: 'ALL' }]
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
  private get list(): any {
    return this.$store.getters.appRetentionList
  }
  private get listHeaders(): string[] {
    if (!this.list) {
      return []
    }
    const listValues: object[] = Object.values(this.list)
    if (listValues.length <= 0) {
      return []
    }
    return listValues ? Object.keys(listValues[0]) : []
  }
  private get additionalAvgs(): any[] {
    const listValues: object[] = Object.values(this.list)
    if (listValues.length <= 0) {
      return []
    }
    const ret: any[] = []

    for (let i = 0; i < Object.keys(listValues[0]).length; ++i) {
      let installCount: number = 0
      let dayCount: number = 0
      listValues.forEach((value: any) => {
        if (!value['D_' + i]) {
          return
        }
        installCount += value.D_0.count
        dayCount += value['D_' + i].count
      })
      ret.push({ dayCount, installCount })
    }

    return ret
  }
  private get clipboardText(): string {
    const localeOption = { style: 'percent', maximumFractionDigits: 1 }
    let txt = '\t인스톨\t' + this.listHeaders.join('\t') + '\n'
    txt += '가중평균\t\t' + this.additionalAvgs.map((item) => {
      return (item.dayCount / item.installCount).toLocaleString(undefined, localeOption)
        + ' (' + item.dayCount + '/' + item.installCount + ')'
    }).join('\t') + '\n'
    for (const [key, value] of Object.entries<any>(this.list)) {
      txt += `${key}\t`
      if (this.displayType === 'both') {
        txt += `${this.sumPercent(value).toLocaleString()}% (${value.D_0.count})\t`
      } else if (this.displayType === 'count') {
        txt += `${value.D_0.count}\t`
      } else {
        txt += `${this.sumPercent(value).toLocaleString()}%\t`
      }

      // @ts-ignore
      txt += Object.values<any>(value).map((item) => {
        if (this.displayType === 'both') {
          return `${item.percent}% (${item.count})`
        } else if (this.displayType === 'count') {
          return item.count.toString()
        }
        return `${item.percent}%`
      }).join('\t') + '\n'
    }

    return txt
  }

  private created() {
    const now = new Date()
    const offset = now.getTimezoneOffset() * 60 * 1000
    const nowTime = now.getTime() + offset
    this.searchStart = this.$store.getters.totalSearchStart
    this.searchEnd = this.$store.getters.totalSearchEnd
  }

  private mounted(): void {
    this.getData()
  }

  @Watch('$route')
  private onRouteChanged(newValue: any, oldValue: any) {
    if (newValue.params.appId !== oldValue.params.appId) {
      this.countries = []
      this.country = 'ALL'
      this.getData()
    }
  }

  private getData(): void {
    if (this.syncing) {
      return
    }

    this.syncing = true
    const appId = parseInt(this.$route.params.appId, 10)
    if (this.countries.length <= 0) {
      this.$store.dispatch('GET_APP_RETENTION_SEGMENTS', appId)
      .then(({ countries }) => {
        if (!countries) {
          alert('데이터 로드 실패')
          return
        }

        this.countries = uniq(countries)
        this.$store.dispatch('GET_APP_RETENTION_DATA', {
          appId, alias: this.alias, country: this.country,
          from: this.searchStart.replace(/\-/g, ''),
          to: this.searchEnd.replace(/\-/g, '')
        })
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
    } else {
      this.$store.dispatch('GET_APP_RETENTION_DATA', {
        appId, alias: this.alias, country: this.country,
        from: this.searchStart.replace(/\-/g, ''),
        to: this.searchEnd.replace(/\-/g, '')
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
  }

  private onChangeCondition(): void {
    this.getData()
  }

  private cellColor(percent: number): string {
    return `background-color: rgba(0, 0, 255, ${(percent / 100).toFixed(3)}); ` +
      `color: ${percent > 70 ? '#ffffff' : '#000000'}`
  }

  private doCopy(): void {
    const tempElem = document.createElement('textarea')
    tempElem.value = this.clipboardText
    document.body.appendChild(tempElem)

    tempElem.select()
    document.execCommand('copy')
    document.body.removeChild(tempElem)
  }

  private sumPercent(row: any): number {
    return Object.entries(row).reduce(
      (acc, [key, value]: [string, any]) => key === 'D_0' ? acc : acc + value.percent, 0
    )
  }
}
</script>

<style scoped>
.table-collapse table { border-collapse: collapse; }
.table-collapse th, .table-collapse td { border: 1px solid #dddddd; }
.v-input { font-size: 14px; }
</style>