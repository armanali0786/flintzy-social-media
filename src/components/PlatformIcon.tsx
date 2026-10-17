import {
  siFacebook,
  siInstagram,
  siTiktok,
  siX,
  type SimpleIcon,
} from 'simple-icons'
import { PLATFORM_CONFIG } from '@/lib/platforms'
import type { Platform } from '@/types/post'

const ICONS: Record<Platform, SimpleIcon> = {
  facebook: siFacebook,
  instagram: siInstagram,
  x: siX,
  tiktok: siTiktok,
}

interface PlatformIconProps {
  platform: Platform
  className?: string
}

export function PlatformIcon({
  platform,
  className = 'size-4',
}: PlatformIconProps) {
  const icon = ICONS[platform]
  const label = PLATFORM_CONFIG[platform].label

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 24 24"
      fill={`#${icon.hex}`}
      className={className}
    >
      <title>{label}</title>
      <path d={icon.path} />
    </svg>
  )
}
