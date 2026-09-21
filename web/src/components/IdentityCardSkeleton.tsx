import { IDENTITY_CARD_MIN_HEIGHT, IDENTITY_CARD_WRAPPER, PULSE } from './skeletonDimensions'

function IdentityCardSkeleton() {
  return (
    <div
      data-testid="skeleton-identity"
      aria-busy="true"
      className={`${IDENTITY_CARD_WRAPPER} ${IDENTITY_CARD_MIN_HEIGHT}`}
    >
      <div aria-hidden="true" className="flex min-w-0 items-center gap-4">
        <div className={`h-20 w-20 shrink-0 rounded-full bg-header ${PULSE}`} />
        <div className="min-w-0 flex-1 space-y-2">
          <div className={`h-6 w-2/3 rounded bg-header ${PULSE}`} />
          <div className={`h-4 w-1/2 rounded bg-header ${PULSE}`} />
        </div>
      </div>
      <div aria-hidden="true" className="mt-4 grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-14 rounded bg-header ${PULSE}`} />
        ))}
      </div>
    </div>
  )
}

export default IdentityCardSkeleton
