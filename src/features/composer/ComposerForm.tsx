import clsx from 'clsx'
import { useId, useState } from 'react'
import { PlatformIcon } from '@/components/PlatformIcon'
import { toggleValue } from '@/lib/arrays'
import { getLocalTimeZone } from '@/lib/dates'
import { PLATFORM_CONFIG } from '@/lib/platforms'
import { isHttpUrl } from '@/lib/url'
import { PLATFORMS, type Platform } from '@/types/post'
import { CharacterCounters } from './CharacterCounters'

export interface ComposerValues {
  content: string
  platforms: Platform[]
  mediaUrl: string
  /** Value of the datetime-local input, e.g. "2026-10-20T09:30" (local time) */
  scheduledAt: string
}

const INITIAL_VALUES: ComposerValues = {
  content: '',
  platforms: [],
  mediaUrl: '',
  scheduledAt: '',
}

export function ComposerForm({ onCancel }: { onCancel: () => void }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const id = useId()
  const mediaUrl = values.mediaUrl.trim()

  const togglePlatform = (platform: Platform) =>
    setValues((current) => ({
      ...current,
      platforms: toggleValue(current.platforms, platform, PLATFORMS),
    }))

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-content`} className="font-semibold">
          Post content
        </label>
        <textarea
          id={`${id}-content`}
          rows={6}
          className="input resize-y"
          placeholder="What do you want to share?"
          aria-describedby={`${id}-counts`}
          value={values.content}
          onChange={(event) =>
            setValues({ ...values, content: event.target.value })
          }
        />
        <CharacterCounters
          id={`${id}-counts`}
          content={values.content}
          platforms={values.platforms}
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-semibold">Platforms</legend>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((platform) => {
            const checked = values.platforms.includes(platform)
            return (
              <label
                key={platform}
                className={clsx(
                  'chip has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink',
                  checked && 'chip-selected',
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => togglePlatform(platform)}
                />
                <span aria-hidden="true">
                  <PlatformIcon
                    platform={platform}
                    className="size-3.5"
                    monochrome={checked}
                  />
                </span>
                {PLATFORM_CONFIG[platform].label}
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-media`} className="font-semibold">
          Image URL <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id={`${id}-media`}
          type="url"
          inputMode="url"
          className="input"
          placeholder="https://example.com/image.jpg"
          value={values.mediaUrl}
          onChange={(event) =>
            setValues({ ...values, mediaUrl: event.target.value })
          }
        />
        {isHttpUrl(mediaUrl) && <ImagePreview key={mediaUrl} url={mediaUrl} />}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-time`} className="font-semibold">
          Schedule for
        </label>
        <input
          id={`${id}-time`}
          type="datetime-local"
          className="input"
          aria-describedby={`${id}-time-hint`}
          value={values.scheduledAt}
          onChange={(event) =>
            setValues({ ...values, scheduledAt: event.target.value })
          }
        />
        <p id={`${id}-time-hint`} className="text-body-sm text-muted">
          In your time zone ({getLocalTimeZone()})
        </p>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="btn min-h-11 rounded-cta border border-hairline px-6 hover:border-ink"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary px-8" disabled>
          Schedule post
        </button>
      </div>
    </form>
  )
}

function ImagePreview({ url }: { url: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <p className="text-body-sm text-muted">
        Couldn't load a preview for this image.
      </p>
    )
  }

  return (
    <img
      src={url}
      alt="Preview of the attached image"
      onError={() => setFailed(true)}
      className="max-h-48 w-fit rounded-sm border border-hairline object-cover"
    />
  )
}
