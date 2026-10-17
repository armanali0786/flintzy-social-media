import { isHttpUrl } from './url'

describe('isHttpUrl', () => {
  it.each([
    ['https://picsum.photos/200', true],
    ['http://example.com/a.png', true],
    ['ftp://example.com/a.png', false],
    ['javascript:alert(1)', false],
    ['example.com/a.png', false],
    ['', false],
  ])('%s → %s', (value, expected) => {
    expect(isHttpUrl(value)).toBe(expected)
  })
})
