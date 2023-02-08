/** Like {@link Partial}, but recursive.
 * Makes all properties in the property tree optional. */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x)
}
