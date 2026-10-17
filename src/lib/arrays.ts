/** Adds or removes `value`, returning the result in `order`. */
export function toggleValue<T>(list: T[], value: T, order: readonly T[]): T[] {
  return order.filter((item) =>
    item === value ? !list.includes(item) : list.includes(item),
  )
}
