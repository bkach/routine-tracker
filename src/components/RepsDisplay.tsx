interface RepsDisplayProps {
  reps: string
  totalSets?: number
}

export function RepsDisplay({ reps, totalSets }: RepsDisplayProps) {
  // Format display: if multiple sets without restBetweenSets, show "X sets of Y"
  const displayText = totalSets && totalSets > 1
    ? `${totalSets} sets of ${reps}`
    : reps

  return (
    <div className="reps-display" id="repsContainer">
      <span id="repsDisplay">{displayText}</span>
    </div>
  )
}
