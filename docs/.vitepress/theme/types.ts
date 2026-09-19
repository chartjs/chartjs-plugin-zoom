/** A button shown under the chart, exported from a sample as `actions`. */
export interface ChartAction {
  name: string
  handler: (chart: unknown) => void
}
