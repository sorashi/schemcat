import { RunningMaximum } from './RunningMaximum'

describe('RunningMaximum', () => {
  test('Empty returns -Infinity', () => {
    const max = new RunningMaximum()
    expect(max.currentMax).toBe(-Infinity)
  })
  test('add', () => {
    const max = new RunningMaximum()
    max.add([1, 3])
    max.add([3])
    expect(max.currentMax).toBe(3)
  })
})
