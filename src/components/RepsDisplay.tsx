interface RepsDisplayProps {
  reps: string
  totalSets?: number
  setNumber?: number
}

export function RepsDisplay({ reps, totalSets, setNumber }: RepsDisplayProps) {
  // Only show the aggregate "X sets of Y" text when the exercise is not
  // already expanded into one card per set.
  const displayText = totalSets && totalSets > 1 && !setNumber
    ? `${totalSets} sets of ${reps}`
    : reps

  return (
    <div className="reps-display" id="repsContainer">
      <span id="repsDisplay">{displayText}</span>
    </div>
  )
}
