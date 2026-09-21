import type { LoadError } from '../data/loadPlayers'
import { FOCUS_RING } from './focusRing'

interface LoadErrorBannerProps {
  kind?: LoadError['kind']
  onReload?: () => void
}

const sentences: Record<LoadError['kind'], string> = {
  'invalid-schema': 'The player data file is not in the expected format.',
  'duplicate-profile':
    'The player data contains the same player and season more than once.',
  empty: 'The player data file contains no players.',
}

const fallbackSentence = 'Something went wrong while preparing the dashboard.'

function LoadErrorBanner({
  kind,
  onReload = () => window.location.reload(),
}: LoadErrorBannerProps) {
  return (
    <div
      role="alert"
      data-testid="load-error-banner"
      className="flex flex-col items-start gap-3 rounded border border-above bg-card p-4 text-above-text"
    >
      <h2 className="text-lg font-semibold">Player data could not be loaded.</h2>
      <p>{kind ? sentences[kind] : fallbackSentence}</p>
      <button
        type="button"
        data-testid="load-error-reload"
        onClick={() => onReload()}
        className={`rounded border border-above px-3 py-1 text-above-text ${FOCUS_RING}`}
      >
        Reload Application
      </button>
    </div>
  )
}

export default LoadErrorBanner
