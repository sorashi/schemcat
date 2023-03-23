export function toKebabCase(s: string): string {
  return s.replaceAll(/\s+/g, '-').toLowerCase()
}
