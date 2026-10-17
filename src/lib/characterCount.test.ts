import { countCharacters, getCharacterCounts } from './characterCount'

describe('countCharacters', () => {
  it.each([
    ['', 0],
    ['Hello', 5],
    ['Line 1\nLine 2', 13],
    ['☕', 1],
    ['👍🏽', 1],
    ['👨‍👩‍👧', 1],
    ['🇮🇳 India', 7],
    ['e\u0301', 1], // e + combining acute accent
  ])('counts %j as %i', (text, expected) => {
    expect(countCharacters(text)).toBe(expected)
  })
})

describe('getCharacterCounts', () => {
  it('uses each platform limit', () => {
    const counts = getCharacterCounts('Hi', [
      'x',
      'instagram',
      'tiktok',
      'facebook',
    ])

    expect(counts.map(({ platform, limit }) => [platform, limit])).toEqual([
      ['x', 280],
      ['instagram', 2200],
      ['tiktok', 2200],
      ['facebook', 5000],
    ])
  })

  it('accepts content exactly at the limit', () => {
    const [x] = getCharacterCounts('a'.repeat(280), ['x'])
    expect(x).toMatchObject({ count: 280, remaining: 0, isOverLimit: false })
  })

  it('flags content one character over the limit', () => {
    const [x] = getCharacterCounts('a'.repeat(281), ['x'])
    expect(x).toMatchObject({ count: 281, remaining: -1, isOverLimit: true })
  })

  it('checks every selected platform independently', () => {
    const counts = getCharacterCounts('a'.repeat(2201), [
      'x',
      'instagram',
      'facebook',
    ])
    expect(counts.map((c) => [c.platform, c.isOverLimit])).toEqual([
      ['x', true],
      ['instagram', true],
      ['facebook', false],
    ])
  })

  it('returns nothing when no platform is selected', () => {
    expect(getCharacterCounts('Hello', [])).toEqual([])
  })
})
