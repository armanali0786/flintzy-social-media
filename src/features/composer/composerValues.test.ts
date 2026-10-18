import {
  INITIAL_VALUES,
  validateComposer,
  type ComposerValues,
} from './composerValues'

const valid: ComposerValues = {
  content: 'Hello world',
  platforms: ['x'],
  mediaUrl: '',
  scheduledAt: '2026-10-20T09:30',
}

describe('validateComposer', () => {
  it('accepts a complete post', () => {
    expect(validateComposer(valid)).toEqual({
      content: undefined,
      platforms: undefined,
      mediaUrl: undefined,
      scheduledAt: undefined,
    })
  })

  it('reports every missing required field', () => {
    expect(validateComposer(INITIAL_VALUES)).toEqual({
      content: 'Write something before scheduling.',
      platforms: 'Select at least one platform.',
      mediaUrl: undefined,
      scheduledAt: 'Choose a date and time.',
    })
  })

  it('treats whitespace-only content as empty', () => {
    expect(validateComposer({ ...valid, content: '  \n ' }).content).toBe(
      'Write something before scheduling.',
    )
  })

  it('accepts content exactly at the limit', () => {
    const errors = validateComposer({ ...valid, content: 'a'.repeat(280) })
    expect(errors.content).toBeUndefined()
  })

  it('rejects content over the limit of any selected platform', () => {
    const errors = validateComposer({
      ...valid,
      content: 'a'.repeat(281),
      platforms: ['facebook', 'x'],
    })
    expect(errors.content).toBe('Too long for X (max 280).')
  })

  it('names every platform that is over its limit', () => {
    const errors = validateComposer({
      ...valid,
      content: 'a'.repeat(2201),
      platforms: ['facebook', 'instagram', 'x', 'tiktok'],
    })
    expect(errors.content).toBe(
      'Too long for Instagram (max 2,200), X (max 280), and TikTok (max 2,200).',
    )
  })

  it.each([
    ['', undefined],
    ['   ', undefined],
    ['https://picsum.photos/200', undefined],
    [' https://picsum.photos/200 ', undefined],
    [
      'picsum.photos/200',
      'Enter a valid image URL (starting with http:// or https://).',
    ],
    [
      'javascript:alert(1)',
      'Enter a valid image URL (starting with http:// or https://).',
    ],
  ])('validates the image URL %j', (mediaUrl, expected) => {
    expect(validateComposer({ ...valid, mediaUrl }).mediaUrl).toBe(expected)
  })
})
