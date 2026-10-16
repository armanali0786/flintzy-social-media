import type { Platform } from '@/types/post'

interface PlatformConfig {
  label: string
  charLimit: number
}

export const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  facebook: { label: 'Facebook', charLimit: 5000 },
  instagram: { label: 'Instagram', charLimit: 2200 },
  x: { label: 'X', charLimit: 280 },
  tiktok: { label: 'TikTok', charLimit: 2200 },
}
