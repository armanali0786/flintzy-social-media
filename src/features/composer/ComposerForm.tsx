import clsx from 'clsx'
import { useId, useState, type FormEvent } from 'react'
import { PlatformIcon } from '@/components/PlatformIcon'
import { toggleValue } from '@/lib/arrays'
import { getLocalTimeZone, toLocalInputValue } from '@/lib/dates'
import { PLATFORM_CONFIG } from '@/lib/platforms'
import { isHttpUrl } from '@/lib/url'
import { PLATFORMS, type Platform } from '@/types/post'
import { CharacterCounters } from './CharacterCounters'
import {
  COMPOSER_FIELDS,
  INITIAL_VALUES,
  validateComposer,
  type ComposerField,
  type ComposerValues,
} from './composerValues'

interface ComposerFormProps {
  onSubmit: (values: ComposerValues) => void
  onCancel: () => void
  isSubmitting?: boolean
  submitError?: string
}

export function ComposerForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError,
}: ComposerFormProps) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [touched, setTouched] = useState<ReadonlySet<ComposerField>>(new Set())
  const [submitAttempted, setSubmitAttempted] = useState(false)
  // Time used for the "must be in the future" rule. Fixed during render to
  // keep it pure, and refreshed on every submit attempt.
  const [checkedAt, setCheckedAt] = useState(() => new Date())
  const id = useId()

  const errors = validateComposer(values, checkedAt)
  const mediaUrl = values.mediaUrl.trim()

  const fieldId: Record<ComposerField, string> = {
    content: `${id}-content`,
    platforms: `${id}-platforms`,
    mediaUrl: `${id}-media`,
    scheduledAt: `${id}-time`,
  }
  const errorId = (field: ComposerField) => `${fieldId[field]}-error`
  const visibleError = (field: ComposerField) =>
    submitAttempted || touched.has(field) ? errors[field] : undefined

  const markTouched = (field: ComposerField) =>
    setTouched((current) => new Set(current).add(field))

  const update = <K extends ComposerField>(
    field: K,
    value: ComposerValues[K],
  ) => setValues((current) => ({ ...current, [field]: value }))

  const togglePlatform = (platform: Platform) =>
    setValues((current) => ({
      ...current,
      platforms: toggleValue(current.platforms, platform, PLATFORMS),
    }))

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    const now = new Date()
    setCheckedAt(now)
    const submitErrors = validateComposer(values, now)
    const firstInvalid = COMPOSER_FIELDS.find((field) => submitErrors[field])

    if (firstInvalid) {
      setSubmitAttempted(true)
      document.getElementById(fieldId[firstInvalid])?.focus()
      return
    }
    onSubmit(values)
  }

  /** Props that connect a field to its hint and error message. */
  const a11yProps = (field: ComposerField, hintId?: string) => {
    const error = visibleError(field)
    const describedBy = [hintId, error && errorId(field)]
      .filter(Boolean)
      .join(' ')
    return {
      'aria-invalid': error ? true : undefined,
      'aria-describedby': describedBy || undefined,
    }
  }

  return (
    <form className="flex flex-col gap-6" noValidate onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label htmlFor={fieldId.content} className="font-semibold">
          Post content
        </label>
        <textarea
          id={fieldId.content}
          rows={6}
          className="input resize-y aria-invalid:border-danger"
          placeholder="What do you want to share?"
          value={values.content}
          onChange={(event) => update('content', event.target.value)}
          onBlur={() => markTouched('content')}
          {...a11yProps('content', `${id}-counts`)}
        />
        <CharacterCounters
          id={`${id}-counts`}
          content={values.content}
          platforms={values.platforms}
        />
        <FieldError id={errorId('content')} message={visibleError('content')} />
      </div>

      <fieldset
        className="flex flex-col gap-2"
        aria-describedby={
          visibleError('platforms') ? errorId('platforms') : undefined
        }
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            markTouched('platforms')
          }
        }}
      >
        <legend className="mb-2 font-semibold">Platforms</legend>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((platform, index) => {
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
                  id={index === 0 ? fieldId.platforms : undefined}
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
        <FieldError
          id={errorId('platforms')}
          message={visibleError('platforms')}
        />
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor={fieldId.mediaUrl} className="font-semibold">
          Image URL <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id={fieldId.mediaUrl}
          type="url"
          inputMode="url"
          className="input aria-invalid:border-danger"
          placeholder="https://example.com/image.jpg"
          value={values.mediaUrl}
          onChange={(event) => update('mediaUrl', event.target.value)}
          onBlur={() => markTouched('mediaUrl')}
          {...a11yProps('mediaUrl')}
        />
        <FieldError
          id={errorId('mediaUrl')}
          message={visibleError('mediaUrl')}
        />
        {isHttpUrl(mediaUrl) && <ImagePreview key={mediaUrl} url={mediaUrl} />}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={fieldId.scheduledAt} className="font-semibold">
          Schedule for
        </label>
        <input
          id={fieldId.scheduledAt}
          type="datetime-local"
          className="input aria-invalid:border-danger"
          min={toLocalInputValue(checkedAt)}
          value={values.scheduledAt}
          onChange={(event) => update('scheduledAt', event.target.value)}
          onBlur={() => markTouched('scheduledAt')}
          {...a11yProps('scheduledAt', `${id}-time-hint`)}
        />
        <p id={`${id}-time-hint`} className="text-body-sm text-muted">
          In your time zone ({getLocalTimeZone()})
        </p>
        <FieldError
          id={errorId('scheduledAt')}
          message={visibleError('scheduledAt')}
        />
      </div>

      {submitError && (
        <p
          role="alert"
          className="rounded-sm bg-danger-soft px-3 py-2 text-body-sm text-danger"
        >
          {submitError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="btn min-h-11 rounded-cta border border-hairline px-6 hover:border-ink"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary px-8"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Scheduling…' : 'Schedule post'}
        </button>
      </div>
    </form>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="text-body-sm font-semibold text-danger">
      {message}
    </p>
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
