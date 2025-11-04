import { calculateProgress } from '../utils/exercises'
import type { ExpandedExercise } from '../types'

interface ProgressBarProps {
  currentIndex: number
  totalExercises: number
  currentExercise: ExpandedExercise
}

export function ProgressBar({ currentIndex, totalExercises, currentExercise }: ProgressBarProps) {
  const progress = calculateProgress(currentIndex, totalExercises)

  return (
    <div className="progress-container">
      <div className="progress-text">
        <span id="progressText">Exercise {currentIndex + 1} of {totalExercises}</span>
        <span id="sectionName">{currentExercise.section}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" id="progressFill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
