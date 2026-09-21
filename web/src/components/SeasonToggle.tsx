import { useId } from 'react'

interface SeasonToggleProps {
  seasons: number[]
  selected: number
  onSelect: (season: number) => void
}

function SeasonToggle({ seasons, selected, onSelect }: SeasonToggleProps) {
  const groupName = useId()
  return (
    <div
      role="radiogroup"
      aria-label="Season"
      data-testid="season-toggle"
      className="inline-flex max-w-full flex-nowrap gap-1 whitespace-nowrap"
    >
      {seasons.map((season) => {
        const id = `${groupName}-${season}`
        const isSelected = season === selected
        return (
          <div key={season} className="relative">
            <input
              type="radio"
              id={id}
              name={groupName}
              value={season}
              checked={isSelected}
              onChange={() => onSelect(season)}
              data-testid={`season-option-${season}`}
              className="peer sr-only"
            />
            <label
              htmlFor={id}
              className={`block cursor-pointer rounded border-b-2 px-3 py-1 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-below ${
                isSelected
                  ? 'border-below bg-card font-semibold text-foreground'
                  : 'border-transparent text-subtext'
              }`}
            >
              {season}
            </label>
          </div>
        )
      })}
    </div>
  )
}

export default SeasonToggle
