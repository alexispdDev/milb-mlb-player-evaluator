import { useState } from 'react'
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react'
import { filterPlayers, type PlayerSummary } from '../data/loadPlayers'

interface PlayerSelectorProps {
  players: PlayerSummary[]
  selectedId: string
  onSelect: (id: string) => void
}

function PlayerSelector({ players, selectedId, onSelect }: PlayerSelectorProps) {
  const [query, setQuery] = useState('')
  const filtered = filterPlayers(players, query)
  const nameOf = (id: string | null) =>
    players.find((p) => p.id === id)?.fullName ?? ''

  return (
    <div data-testid="player-selector" className="relative w-64 max-w-full">
      <Combobox
        value={selectedId}
        onChange={(id: string | null) => {
          if (id !== null) onSelect(id)
        }}
        onClose={() => setQuery('')}
        immediate
      >
        <ComboboxInput
          aria-label="Player"
          data-testid="player-selector-input"
          className="w-full max-w-full truncate rounded bg-card px-2 py-1 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-below"
          displayValue={nameOf}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ComboboxOptions className="absolute left-0 top-full z-10 mt-1 max-h-60 w-full overflow-auto rounded border border-subtext bg-card text-foreground shadow-lg">
          {filtered.length === 0 ? (
            <div
              data-testid="player-selector-empty"
              className="px-2 py-1 text-subtext"
            >
              {`No player found matching '${query}'`}
            </div>
          ) : (
            filtered.map((p) => (
              <ComboboxOption
                key={p.id}
                value={p.id}
                data-testid="player-selector-option"
                className="cursor-pointer truncate px-2 py-1 text-foreground data-[focus]:bg-header"
              >
                {p.fullName}
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </Combobox>
    </div>
  )
}

export default PlayerSelector
