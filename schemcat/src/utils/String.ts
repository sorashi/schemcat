export function toKebabCase(s: string): string {
  return s.replaceAll(/\s+/g, '-').toLowerCase()
}
export function isOnlyWhitespace(s: string): boolean {
  return s.replaceAll(/\s/g, '').length === 0
}
