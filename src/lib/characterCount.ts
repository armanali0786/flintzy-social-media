import type { Platform } from '@/types/post'
import { PLATFORM_CONFIG } from './platforms'

export interface CharacterCount {
  platform: Platform
  count: number
  limit: number
  remaining: number
  isOverLimit: boolean
}

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

/**
 * Counts user-perceived characters, so emoji such as "👍🏽" or "👨‍👩‍👧" count
 * as one. `string.length` would count UTF-16 code units instead.
 */
export function countCharacters(text: string): number {
  return Array.from(graphemes.segment(text)).length
}

export function getCharacterCounts(
  text: string,
  platforms: Platform[],
): CharacterCount[] {
  const count = countCharacters(text)

  return platforms.map((platform) => {
    const limit = PLATFORM_CONFIG[platform].charLimit
    return {
      platform,
      count,
      limit,
      remaining: limit - count,
      isOverLimit: count > limit,
    }
  })
}
