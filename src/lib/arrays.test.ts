import { toggleValue } from './arrays'

describe('toggleValue', () => {
  const order = ['a', 'b', 'c'] as const

  it('adds a missing value in canonical order', () => {
    expect(toggleValue(['c'], 'a', order)).toEqual(['a', 'c'])
  })

  it('removes a present value', () => {
    expect(toggleValue(['a', 'c'], 'c', order)).toEqual(['a'])
  })
})
