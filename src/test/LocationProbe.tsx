import { useLocation } from 'react-router'

/** Renders the current URL search string so tests can assert on it. */
export function LocationProbe() {
  const { search } = useLocation()
  return <span data-testid="location-search">{search}</span>
}
