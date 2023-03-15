import { RunningMaximum } from './RunningMaximum'

describe('RunningMaximum', () => {
  test('Empty returns -Infinity', () => {
    let max = new RunningMaximum()
    expect(max.currentMax).toBe(-Infinity)
  })
  test('add', () => {
    let max = new RunningMaximum()
    max.add([1, 3])
    max.add([3])
    expect(max.currentMax).toBe(3)
  })
})
