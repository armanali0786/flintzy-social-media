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
  /** Use the current text colour instead of the brand colour. */
  monochrome?: boolean
}

export function PlatformIcon({
  platform,
  className = 'size-4',
  monochrome = false,
}: PlatformIconProps) {
  const icon = ICONS[platform]
  const label = PLATFORM_CONFIG[platform].label

  return (
    <svg
      // An inline <svg> needs role="img" to be announced with its label.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="img"
      aria-label={label}
      viewBox="0 0 24 24"
      fill={monochrome ? 'currentColor' : `#${icon.hex}`}
      className={className}
    >
      <title>{label}</title>
      <path d={icon.path} />
    </svg>
  )
}
