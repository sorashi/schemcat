import { toKebabCase } from './String'

describe('toKebabCase', () => {
  test('single word', () => {
    expect(toKebabCase('hi')).toBe('hi')
  })
  test('empty string', () => {
    expect(toKebabCase('')).toBe('')
  })
  test('space separated', () => {
    expect(toKebabCase('lorem ipsum')).toBe('lorem-ipsum')
  })
  test('different case', () => {
    expect(toKebabCase('LoreM Ipsum')).toBe('lorem-ipsum')
  })
  test('more whitespace', () => {
    expect(toKebabCase('lorem   ipsum \tdolor\n sit')).toBe('lorem-ipsum-dolor-sit')
  })
})
