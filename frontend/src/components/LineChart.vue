<script lang="ts">
import { Line, mixins } from 'vue-chartjs'
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  extends: Line,
  mixins: [mixins.reactiveProp]
})
export default class LineChart extends Vue {
  @Prop()
  public chartData!: any
  @Prop()
  public options?: any

  public mounted() {
    // @ts-ignore
    this.renderChart(this.chartData, this.options)
  }
}
</script>