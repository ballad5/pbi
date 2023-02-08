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
          item-title="text"
          item-value="value"
          label="platform"
          v-model="alias"
          @change="onChangeCondition"
          outlined
          dense
        ></v-select>
        
        <v-select
          :items="isoCountries"
          item-title="text"
          item-value="value"
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
          <Datepicker v-model="date" range :format="dateFormat" :enable-time-picker="false"
              @update:modelValue="onChangeCondition"></Datepicker>                       
        </div>
      </v-col>
      <v-spacer></v-spacer>
      <v-col cols="12" md="4" class="body-2 d-flex justify-end">
        <v-radio-group inline v-model="displayType" row dense>
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
          <v-table >  
            <thead>
              <tr class="light-blue lighten-5">
                <th></th>
                <th class="text-center" v-for="item in listHeaders" :key="item">{{ item.replace('_', '-') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, key) in list" :key="key">
                <td class="text-center">{{ key }}</td>
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
          </v-table>
        </template>
      </v-col>
    </v-row>

    <v-overlay :value="syncing">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-facing-decorator'
import format from 'date-fns/format'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { dataStore, accountStore, appStore, commonStore } from '@/store'
import { useRouter, useRoute } from 'vue-router'

@Component({
  components: {
    Datepicker,
  }
})
export default class Retention extends Vue {
  private dataStore = dataStore()
  private accountStore = accountStore()
  private appStore = appStore()
  private commonStore = commonStore()

  private route = useRoute()
  private router = useRouter()

  public syncing: boolean = false
  public dateFormat = 'yyyy-MM-dd'
  public alias: string = 'mobile'
  public country: string = 'ALL'
  public searchStart: string = ''
  public searchEnd: string = ''
  public maxSearchDate: string = ''
  public platforms = [
    { text: 'ALL', value: 'mobile' }, { text: 'GOOGLE', value: 'mobile_android' }
  ]
  public countries: any[any] = []
  public displayType: string = 'both'

  public get appName(): string { return this.appStore.getAppName }
  public get isoCountries(): any[] {
    const ret: any[] = [{ text: 'ALL', value: 'ALL' }]
    if (this.countries.length > 0) {
      this.countries.forEach((row: any) => {
        if (this.commonStore.isoCountries[row]) {
          ret.push({ text: this.commonStore.isoCountries[row], value: row })
        }
      })
    }
    return ret
  }
  
  public get date() { return [this.searchStart, this.searchEnd] }
  public set date(value : any[]) {   
    this.searchStart = format(new Date(value[0]), this.dateFormat)
    this.searchEnd = format(new Date(value[1]), this.dateFormat)
  }

  public get list(): any {
    return this.appStore.getAppRetentionList
  }
  public get listHeaders(): string[] {
    if (!this.list) {
      return []
    }
    const listValues: object[] = Object.values(this.list)
    if (listValues.length <= 0) {
      return []
    }
    return listValues ? Object.keys(listValues[0]) : []
  }
  public get additionalAvgs(): any[] {
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
  public get clipboardText(): string {
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
    this.searchStart = this.dataStore.getTotalSearchStart
    this.searchEnd = this.dataStore.getTotalSearchEnd
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

  public getData(): void {
    if (this.syncing) {      
      return
    }

    this.syncing = true
    const appId: number = Number(this.route.params.appId)
    if (this.countries.length <= 0) {
      this.appStore.actionAppRetentionSegments(Number(appId))
      .then((countries: any) => {
        if (!countries) {
          alert('데이터 로드 실패')
          return
        }
        this.appStore.actionAppRetentionData(
          appId, this.alias, this.country,
          this.searchStart.replace(/-/g,''),
          this.searchEnd.replace(/-/g, '')
        )
      })
      .catch((err) => {
        if (err && err.status === 401) {
          this.accountStore.signOut()
          this.router.push('/signin')
          return
        }
        alert('데이터 로드 실패')
      })
      .finally(() => {
        this.syncing = false
      })
    } else {
      this.appStore.actionAppRetentionData(  
        appId, this.alias, this.country,
        this.searchStart.replace(/-/g, ''),
        this.searchEnd.replace(/-/g, '')
      )
      .catch((err) => {
        if (err && err.status === 401) {
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
  }

  public onChangeCondition(): void {   
    this.getData()
  }

  public cellColor(percent: number): string {
    return `background-color: rgba(0, 0, 255, ${(percent / 100).toFixed(3)}); ` +
      `color: ${percent > 70 ? '#ffffff' : '#000000'}`
  }

  public doCopy(): void {
    const tempElem = document.createElement('textarea')
    tempElem.value = this.clipboardText
    document.body.appendChild(tempElem)

    tempElem.select()
    document.execCommand('copy')
    document.body.removeChild(tempElem)
  }

  public sumPercent(row: any): number {
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
.datepicker-trigger { width: 100%; }
#searchDateTrigger { cursor: pointer; }
</style>