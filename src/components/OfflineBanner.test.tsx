import { act, render, screen } from '@testing-library/react'
import { OfflineBanner } from './OfflineBanner'

function setOnline(online: boolean) {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(online)
  act(() => {
    window.dispatchEvent(new Event(online ? 'online' : 'offline'))
  })
}

describe('OfflineBanner', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('stays empty while online', () => {
    render(<OfflineBanner />)
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('announces going offline and clears when back online', () => {
    render(<OfflineBanner />)

    setOnline(false)
    expect(screen.getByRole('status')).toHaveTextContent("You're offline.")

    setOnline(true)
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })
})
