import { getCharacterCounts } from '@/lib/characterCount'
import { PLATFORM_CONFIG } from '@/lib/platforms'
import { isHttpUrl } from '@/lib/url'
import type { Platform } from '@/types/post'

export interface ComposerValues {
  content: string
  platforms: Platform[]
  mediaUrl: string
  /** Value of the datetime-local input, e.g. "2026-10-20T09:30" (local time) */
  scheduledAt: string
}

export type ComposerField = keyof ComposerValues
export type ComposerErrors = Partial<Record<ComposerField, string>>

export const INITIAL_VALUES: ComposerValues = {
  content: '',
  platforms: [],
  mediaUrl: '',
  scheduledAt: '',
}

const listFormat = new Intl.ListFormat('en', { type: 'conjunction' })

function validateContent({ content, platforms }: ComposerValues) {
  if (content.trim() === '') return 'Write something before scheduling.'

  const tooLong = getCharacterCounts(content, platforms)
    .filter((count) => count.isOverLimit)
    .map(
      ({ platform, limit }) =>
        `${PLATFORM_CONFIG[platform].label} (max ${limit.toLocaleString()})`,
    )
  return tooLong.length > 0
    ? `Too long for ${listFormat.format(tooLong)}.`
    : undefined
}

export function validateComposer(values: ComposerValues): ComposerErrors {
  const mediaUrl = values.mediaUrl.trim()
  return {
    content: validateContent(values),
    platforms:
      values.platforms.length === 0
        ? 'Select at least one platform.'
        : undefined,
    mediaUrl:
      mediaUrl !== '' && !isHttpUrl(mediaUrl)
        ? 'Enter a valid image URL (starting with http:// or https://).'
        : undefined,
    scheduledAt:
      values.scheduledAt === '' ? 'Choose a date and time.' : undefined,
  }
}

/** Fields in on-screen order, used to focus the first invalid one. */
export const COMPOSER_FIELDS: ComposerField[] = [
  'content',
  'platforms',
  'mediaUrl',
  'scheduledAt',
]
