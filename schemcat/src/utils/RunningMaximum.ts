export class RunningMaximum {
  public currentMax = -Infinity
  addRest(...values: number[]) {
    this.currentMax = Math.max(this.currentMax, ...values)
  }
  add(values?: number[]) {
    if (!values) return
    this.currentMax = Math.max(this.currentMax, ...values)
  }
}
