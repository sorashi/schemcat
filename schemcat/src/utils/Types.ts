/** Like {@link Partial}, but recursive.
 * Makes all properties in the property tree optional. */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T
}

export function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x)
}
export type Constructor<T extends object = object> = new (...args: any[]) => T
export type ParameterlessConstructor<T extends object = object> = new () => T
export function shallowClone<T extends object = object>(activator: ParameterlessConstructor<T>, from: T): T {
  return Object.assign(new activator(), from)
}

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  if (value === null || value === undefined) return false
  const testDummy: TValue = value
  return true
}
