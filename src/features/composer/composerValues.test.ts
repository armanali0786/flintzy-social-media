import {
  INITIAL_VALUES,
  toNewPost,
  validateComposer,
  type ComposerValues,
} from './composerValues'

// Tests run in Asia/Kolkata (UTC+5:30), configured in vite.config.ts.
const now = new Date('2026-10-16T06:30:00.000Z') // 16 Oct, 12:00 local

const valid: ComposerValues = {
  content: 'Hello world',
  platforms: ['x'],
  mediaUrl: '',
  scheduledAt: '2026-10-20T09:30',
}

describe('validateComposer', () => {
  it('accepts a complete post', () => {
    expect(validateComposer(valid, now)).toEqual({
      content: undefined,
      platforms: undefined,
      mediaUrl: undefined,
      scheduledAt: undefined,
    })
  })

  it('reports every missing required field', () => {
    expect(validateComposer(INITIAL_VALUES, now)).toEqual({
      content: 'Write something before scheduling.',
      platforms: 'Select at least one platform.',
      mediaUrl: undefined,
      scheduledAt: 'Choose a date and time.',
    })
  })

  it('treats whitespace-only content as empty', () => {
    expect(validateComposer({ ...valid, content: '  \n ' }, now).content).toBe(
      'Write something before scheduling.',
    )
  })

  it('accepts content exactly at the limit', () => {
    const errors = validateComposer({ ...valid, content: 'a'.repeat(280) }, now)
    expect(errors.content).toBeUndefined()
  })

  it('rejects content over the limit of any selected platform', () => {
    const errors = validateComposer(
      {
        ...valid,
        content: 'a'.repeat(281),
        platforms: ['facebook', 'x'],
      },
      now,
    )
    expect(errors.content).toBe('Too long for X (max 280).')
  })

  it('names every platform that is over its limit', () => {
    const errors = validateComposer(
      {
        ...valid,
        content: 'a'.repeat(2201),
        platforms: ['facebook', 'instagram', 'x', 'tiktok'],
      },
      now,
    )
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
    expect(validateComposer({ ...valid, mediaUrl }, now).mediaUrl).toBe(
      expected,
    )
  })

  it.each([
    ['2026-10-16T12:01', undefined],
    ['2026-10-17T00:00', undefined],
    ['2026-10-16T12:00', 'Choose a time in the future.'],
    ['2026-10-16T11:59', 'Choose a time in the future.'],
    ['2025-10-20T09:30', 'Choose a time in the future.'],
    ['2026-02-30T10:00', 'Enter a valid date and time.'],
    ['garbage', 'Enter a valid date and time.'],
  ])('validates the scheduled time %j', (scheduledAt, expected) => {
    expect(validateComposer({ ...valid, scheduledAt }, now).scheduledAt).toBe(
      expected,
    )
  })
})

describe('toNewPost', () => {
  it('stores the scheduled time as a UTC ISO string', () => {
    expect(toNewPost(valid).scheduledAt).toBe('2026-10-20T04:00:00.000Z')
  })

  it('trims content and image URL, and omits an empty image URL', () => {
    expect(
      toNewPost({ ...valid, content: '  Hi  ', mediaUrl: ' https://a.io/x ' }),
    ).toMatchObject({ content: 'Hi', mediaUrl: 'https://a.io/x' })
    expect(toNewPost({ ...valid, mediaUrl: '   ' }).mediaUrl).toBeUndefined()
  })

  it('refuses values that were not validated', () => {
    expect(() => toNewPost({ ...valid, scheduledAt: '' })).toThrow()
  })
})
