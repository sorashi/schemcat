import globalIdGenerator from './GlobalIdGenerator'

describe('GlobalIdGenerator', () => {
  test('First ID is 1', () => {
    expect(globalIdGenerator.nextId()).toBe(1)
  })
  test('Next ID is 2', () => {
    expect(globalIdGenerator.nextId()).toBe(2)
  })
  test('Reset ID resets to 1', () => {
    globalIdGenerator.resetId()
    expect(globalIdGenerator.nextId()).toBe(1)
  })
})
