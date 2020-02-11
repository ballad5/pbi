<script lang="ts">
import { Bar } from 'vue-chartjs'
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

@Component({
  extends: Bar
})
export default class BarChart extends Vue {
  @Prop()
  public chartData!: any
  @Prop()
  public options?: any

  public mounted() {
    // @ts-ignore
    this.renderChart(this.chartData, this.options)
  }

  @Watch('chartData')
  private onDataChange(newValue: any, oldValue: any) {
    // @ts-ignore
    this.renderChart(this.chartData, this.options)
  }
}
</script>